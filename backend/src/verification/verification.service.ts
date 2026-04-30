import {
  Injectable, BadRequestException,
  InternalServerErrorException, Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity, VerificationStatus } from '../user/infrastructure/persistence/entities/user.entity';
import Groq from 'groq-sdk';

interface DocumentFormData {
  cedula: string;
  firstName: string;
  firstLastName: string;
  birthDate: string;
}

export interface VerificationResult {
  verified: boolean;
  status: VerificationStatus;
  confidence: number;
  extractedData: {
    cedula?: string;
    firstName?: string;
    firstLastName?: string;
    birthDate?: string;
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
  ) {
    this.groq = new Groq({
      apiKey: this.configService.get<string>('GROQ_API_KEY') ?? '',
    });
  }

  async verifyDocument(
    images: Express.Multer.File[],
    formData: DocumentFormData,
    userId: number | null,
  ): Promise<VerificationResult> {
    try {
      // 1. Convertir primera imagen a base64
      const image = images[0];
      const base64Image = image.buffer.toString('base64');
      const mimeType = image.mimetype;

      // 2. Llamar a Groq con visión
      const response = await this.groq.chat.completions.create({
        model: 'meta-llama/llama-4-scout-17b-16e-instruct',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: {
                  url: `data:${mimeType};base64,${base64Image}`,
                },
              },
              {
                type: 'text',
                text: `Eres un sistema de verificación de identidad para Colombia.
Analiza esta cédula de ciudadanía colombiana y extrae los datos.

RESPONDE ÚNICAMENTE con este JSON (sin texto adicional, sin markdown, sin backticks):
{
  "cedula": "número de cédula sin puntos ni espacios",
  "firstName": "primer nombre en mayúsculas",
  "firstLastName": "primer apellido en mayúsculas",
  "birthDate": "fecha de nacimiento en formato YYYY-MM-DD",
  "isValidDocument": true,
  "documentType": "tipo de documento detectado"
}

Si no puedes leer algún campo claramente, usa null para ese campo.
Si la imagen no es una cédula colombiana, pon isValidDocument: false.`,
              },
            ],
          },
        ],
        max_tokens: 512,
        temperature: 0.1,
      });

      const rawText = response.choices[0]?.message?.content ?? '';

      // 3. Parsear respuesta
      let extracted: any;
      try {
        const clean = rawText.replace(/```json|```/g, '').trim();
        extracted = JSON.parse(clean);
      } catch {
        this.logger.error('Error parseando respuesta de Groq:', rawText);
        throw new InternalServerErrorException('Error procesando la imagen del documento');
      }

      if (!extracted.isValidDocument) {
        return {
          verified: false,
          status: VerificationStatus.REJECTED,
          confidence: 0,
          extractedData: {},
          mismatches: ['La imagen no corresponde a una cédula de ciudadanía colombiana'],
          message: 'Documento inválido. Por favor sube una foto clara de tu cédula colombiana.',
        };
      }

      // 4. Comparar datos con el formulario
      const mismatches: string[] = [];
      let matchScore = 0;
      const totalFields = 4;

      const cleanNum = (s: string) => s?.replace(/[.\s\-]/g, '') ?? '';
      const normalize = (s: string) =>
        s?.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim() ?? '';

      // Comparar cédula
      if (extracted.cedula && cleanNum(extracted.cedula) === cleanNum(formData.cedula)) {
        matchScore++;
      } else if (extracted.cedula) {
        mismatches.push('Número de cédula no coincide');
      }

      // Comparar nombre
      if (extracted.firstName && normalize(extracted.firstName).includes(normalize(formData.firstName))) {
        matchScore++;
      } else if (extracted.firstName) {
        mismatches.push('Nombre no coincide');
      }

      // Comparar apellido
      if (extracted.firstLastName && normalize(extracted.firstLastName).includes(normalize(formData.firstLastName))) {
        matchScore++;
      } else if (extracted.firstLastName) {
        mismatches.push('Apellido no coincide');
      }

      // Comparar fecha de nacimiento
      if (extracted.birthDate && extracted.birthDate === formData.birthDate) {
        matchScore++;
      } else if (extracted.birthDate) {
        mismatches.push('Fecha de nacimiento no coincide');
      }

      const confidence = Math.round((matchScore / totalFields) * 100);
      const verified = confidence >= 75 && mismatches.length <= 1;
      const status = verified ? VerificationStatus.VERIFIED : VerificationStatus.REJECTED;

      // 5. Guardar en base de datos si hay userId
      // ✅ DESPUÉS — solo guarda si hay userId Y fue verificado
      if (userId && verified) {
        await this.userRepository.update(userId, {
          verification_status: status,
          document_number: formData.cedula,
        });
      }

      return {
        verified,
        status,
        confidence,
        extractedData: {
          cedula: extracted.cedula,
          firstName: extracted.firstName,
          firstLastName: extracted.firstLastName,
          birthDate: extracted.birthDate,
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
  async updateVerificationStatus(userId: number): Promise<void> {
    await this.userRepository.update(userId, {
      verification_status: VerificationStatus.VERIFIED,
    });
  }
}