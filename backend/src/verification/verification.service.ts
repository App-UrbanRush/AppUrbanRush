import {
  Injectable, BadRequestException,
  InternalServerErrorException, Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity, VerificationStatus } from '../user/infrastructure/persistence/entities/user.entity';
import Groq from 'groq-sdk';
import { PeopleEntity } from 'src/people/infrastructure/persistence/entities/people.entity';

interface DocumentFormData {
  cedula: string;
  firstName: string;
  firstLastName: string;
  expeditionDate: string;
  expeditionPlace: string;
}

export interface VerificationResult {
  verified: boolean;
  status: VerificationStatus;
  confidence: number;
  extractedData: {
    cedula?: string;
    firstName?: string;
    firstLastName?: string;
    expeditionDate?: string;
    expeditionPlace?: string;
  };
  mismatches: string[];
  message: string;
}

@Injectable()
export class VerificationService {
  private readonly logger = new Logger(VerificationService.name);
  private readonly groq: Groq;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(PeopleEntity)           
    private readonly peopleRepo: Repository<PeopleEntity>,  
  ) {
    const apiKey = this.configService.get<string>('GROQ_API_KEY') || process.env.GROQ_API_KEY || '';
    this.logger.log(`GROQ API Key configured: ${!!apiKey}`);
    this.groq = new Groq({
      apiKey: apiKey,
    });
  }

  async verifyDocument(
    images: Express.Multer.File[],
    formData: DocumentFormData,
    userId: number | null,
  ): Promise<VerificationResult> {
    try {
      // 1. Convertir primera imagen a base64 (frontal)
      const frontImage = images[0];
      const frontBase64 = frontImage.buffer.toString('base64');
      const frontMimeType = frontImage.mimetype;

      // 2. Convertir segunda imagen a base64 (reverso)
      const backImage = images[1];
      const backBase64 = backImage.buffer.toString('base64');
      const backMimeType = backImage.mimetype;

      // 3. Llamar a Groq con visión para la imagen frontal (datos principales)
      const frontResponse = await this.groq.chat.completions.create({
        model: 'meta-llama/llama-4-scout-17b-16e-instruct',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: {
                  url: `data:${frontMimeType};base64,${frontBase64}`,
                },
              },
              {
                type: 'text',
                text: `Eres un sistema de verificación de identidad para Colombia.
Analiza esta imagen que es la cara FRONTAL de la cédula de ciudadanía colombiana y extrae los datos.

RESPONDE ÚNICAMENTE con este JSON (sin texto adicional, sin markdown, sin backticks):
{
  "cedula": "número de cédula sin puntos ni espacios",
  "firstName": "primer nombre en mayúsculas",
  "firstLastName": "primer apellido en mayúsculas",
  "isValidDocument": true,
  "documentType": "tipo de documento detectado"
}

Si no puedes leer algún campo claramente, usa null para ese campo.
Si la imagen no es la cara frontal de una cédula colombiana, pon isValidDocument: false.`,
              },
            ],
          },
        ],
        max_tokens: 512,
        temperature: 0.1,
      });

      // 4. Llamar a Groq para la imagen posterior (lugar de nacimiento)
      const backResponse = await this.groq.chat.completions.create({
        model: 'meta-llama/llama-4-scout-17b-16e-instruct',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: {
                  url: `data:${backMimeType};base64,${backBase64}`,
                },
              },
              {
                type: 'text',
                text: `Eres un sistema de verificación de identidad para Colombia.
Analiza esta imagen que es la cara POSTERIOR de la cédula de ciudadanía colombiana y extrae la fecha y lugar de expedicion.

RESPONDE ÚNICAMENTE con este JSON (sin texto adicional, sin markdown, sin backticks):
{
  "expeditionDate": "fecha de expedicion en formato YYYY-MM-DD",
  "expeditionPlace": "lugar de expedicion (ciudad, departamento)",
  "isValidDocument": true
}

Si no puedes leer la fecha o lugar de expedicion claramente, usa null.
Si la imagen no es la cara posterior de una cédula colombiana, pon isValidDocument: false.`,
              },
            ],
          },
        ],
        max_tokens: 512,
        temperature: 0.1,
      });

      const frontRawText = frontResponse.choices[0]?.message?.content ?? '';
      const backRawText = backResponse.choices[0]?.message?.content ?? '';

      // 3. Parsear respuesta frontal
      let frontExtracted: any;
      try {
        const cleanFront = frontRawText.replace(/```json|```/g, '').trim();
        frontExtracted = JSON.parse(cleanFront);
      } catch {
        this.logger.error('Error parseando respuesta de Groq (frontal):', frontRawText);
        throw new InternalServerErrorException('Error procesando la imagen frontal del documento');
      }

      // 3b. Parsear respuesta posterior
      let backExtracted: any;
      try {
        const cleanBack = backRawText.replace(/```json|```/g, '').trim();
        backExtracted = JSON.parse(cleanBack);
      } catch {
        this.logger.error('Error parseando respuesta de Groq (posterior):', backRawText);
        throw new InternalServerErrorException('Error procesando la imagen posterior del documento');
      }

      // Verificar que ambas caras sean válidas
      if (!frontExtracted.isValidDocument) {
        return {
          verified: false,
          status: VerificationStatus.REJECTED,
          confidence: 0,
          extractedData: {},
          mismatches: ['La imagen frontal no corresponde a una cédula de ciudadanía colombiana'],
          message: 'Documento inválido. Por favor sube una foto clara de la cara frontal de tu cédula.',
        };
      }

      if (!backExtracted.isValidDocument) {
        return {
          verified: false,
          status: VerificationStatus.REJECTED,
          confidence: 0,
          extractedData: {},
          mismatches: ['La imagen posterior no corresponde a una cédula de ciudadanía colombiana'],
          message: 'Documento inválido. Por favor sube una foto clara de la cara posterior de tu cédula.',
        };
      }

      // 4. Comparar datos con el formulario
      const mismatches: string[] = [];
      let matchScore = 0;
      const totalFields = 5;

      const cleanNum = (s: string) => s?.replace(/[.\s\-]/g, '') ?? '';
      const normalize = (s: string) =>
        s?.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim() ?? '';

      // Comparar cédula
      if (frontExtracted.cedula && cleanNum(frontExtracted.cedula) === cleanNum(formData.cedula)) {
        matchScore++;
      } else if (frontExtracted.cedula) {
        mismatches.push('Número de cédula no coincide');
      }

      // Comparar nombre
      if (frontExtracted.firstName && normalize(frontExtracted.firstName).includes(normalize(formData.firstName))) {
        matchScore++;
      } else if (frontExtracted.firstName) {
        mismatches.push('Nombre no coincide');
      }

      // Comparar apellido
      if (frontExtracted.firstLastName && normalize(frontExtracted.firstLastName).includes(normalize(formData.firstLastName))) {
        matchScore++;
      } else if (frontExtracted.firstLastName) {
        mismatches.push('Apellido no coincide');
      }

      // Comparar fecha de expedicion
      if (backExtracted.expeditionDate && backExtracted.expeditionDate === formData.expeditionDate) {
        matchScore++;
      } else if (backExtracted.expeditionDate) {
        mismatches.push('Fecha de expedicion no coincide');
      }

      // Comparar lugar de expedicion (solo ciudad)
      const normalizePlace = (s: string) => s?.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[.\-_]/g, ' ').replace(/\s+/g, ' ').trim() ?? '';
      
      const docPlace = normalizePlace(backExtracted.expeditionPlace || '');

      let placeMatch = false;
      if (backExtracted.expeditionPlace) {
        const cityUser = normalizePlace(formData.expeditionPlace.split(',')[0] || '');
        if (cityUser && docPlace.includes(cityUser)) {
          placeMatch = true;
        }
      }

      if (backExtracted.expeditionPlace && placeMatch) {
        matchScore++;
      } else if (backExtracted.expeditionPlace) {
        mismatches.push('Lugar de expedicion no coincide');
      } else {
        mismatches.push('No se pudo leer el lugar de expedicion en el documento');
      }

      const confidence = Math.round((matchScore / totalFields) * 100);
      const verified = confidence === 100 && mismatches.length === 0;
      const status = verified ? VerificationStatus.VERIFIED : VerificationStatus.REJECTED;

      // 5. Guardar en base de datos si hay userId
      // ✅ DESPUÉS — solo guarda si hay userId Y fue verificado
      if (userId && verified) {
        await this.userRepository.update(userId, {
          verification_status: status,
        });
      
        await this.peopleRepo.update(
          { user: { user_id: userId } },
          { document_number: formData.cedula },
        );
      }
      

      return {
        verified,
        status,
        confidence,
        extractedData: {
          cedula: frontExtracted.cedula,
          firstName: frontExtracted.firstName,
          firstLastName: frontExtracted.firstLastName,
          expeditionDate: backExtracted.expeditionDate,
          expeditionPlace: backExtracted.expeditionPlace,
        },
        mismatches,
        message: verified
          ? '✅ Identidad verificada correctamente'
          : `❌ Verificación fallida. Problemas: ${mismatches.join(', ')}`,
      };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }
      this.logger.error('Error en verificación:', error);
      throw new InternalServerErrorException('Error al procesar la verificación');
    }
  }
  
  async updateVerificationStatus(userId: number, documentNumber: string): Promise<void> {
    await this.userRepository.update(userId, {
      verification_status: VerificationStatus.VERIFIED,
      // ❌ Eliminar: document_number: documentNumber,
    });
  
    await this.peopleRepo.update(
      { user: { user_id: userId } },
      { document_number: documentNumber },
    );
  }
}