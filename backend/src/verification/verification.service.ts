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
import { cedulasMatch, validateCedula } from './domain/cedula-validator';

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
  documentVariant?: 'AMARILLA' | 'DIGITAL' | 'UNKNOWN';
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

// ──────────────────────── Configuración del score ────────────────────────
// Pesos: número de cédula es lo único que NO puede equivocarse (es único).
// El resto da puntos y el umbral total es 4 de 6.
const WEIGHT = {
  CEDULA: 3,       // obligatorio
  FIRST_NAME: 1,
  LAST_NAME: 1,
  EXPEDITION_DATE: 0.5,
  EXPEDITION_PLACE: 0.5,
} as const;
const MAX_SCORE =
  WEIGHT.CEDULA + WEIGHT.FIRST_NAME + WEIGHT.LAST_NAME +
  WEIGHT.EXPEDITION_DATE + WEIGHT.EXPEDITION_PLACE; // 6
const PASS_THRESHOLD = 4;

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
    this.groq = new Groq({ apiKey });
  }

  async verifyDocument(
    images: Express.Multer.File[],
    formData: DocumentFormData,
    userId: number | null,
  ): Promise<VerificationResult> {
    // ─── Pre-validación de formato del número de cédula (cliente puede saltarla) ───
    const cedulaCheck = validateCedula(formData.cedula);
    if (!cedulaCheck.valid) {
      throw new BadRequestException(cedulaCheck.reason ?? 'Cédula inválida');
    }

    if (!images || images.length < 2) {
      throw new BadRequestException('Se requieren las dos caras de la cédula (frontal y reverso)');
    }

    try {
      const frontImage = images[0];
      const backImage = images[1];

      // Llamadas a la IA en PARALELO — frente y reverso son independientes.
      const [frontResponse, backResponse] = await Promise.all([
        this.readFront(frontImage),
        this.readBack(backImage),
      ]);

      const frontExtracted = this.parseJson(frontResponse, 'frontal');
      const backExtracted = this.parseJson(backResponse, 'posterior');

      // Detectar tipo de cédula (la digital muchas veces no tiene lugar de expedición visible).
      const variant: 'AMARILLA' | 'DIGITAL' | 'UNKNOWN' =
        frontExtracted.documentVariant === 'AMARILLA'
          ? 'AMARILLA'
          : frontExtracted.documentVariant === 'DIGITAL'
            ? 'DIGITAL'
            : 'UNKNOWN';

      if (!frontExtracted.isValidDocument) {
        return this.rejection(
          'La imagen frontal no parece una cédula de ciudadanía colombiana',
          'Sube una foto más clara de la cara frontal de tu cédula (amarilla o digital).',
          variant,
        );
      }
      // El reverso se acepta si:
      //  - La IA lo marca como válido, O
      //  - Detecta QR o MRZ (señales propias de cédula digital)
      const backHasDigitalMarkers = !!(backExtracted.hasQR || backExtracted.hasMRZ);
      if (!backExtracted.isValidDocument && !backHasDigitalMarkers) {
        return this.rejection(
          'La imagen del reverso no parece una cédula colombiana',
          'Subí una foto del reverso de tu cédula donde se vea el código QR, el MRZ o "REGISTRADOR NACIONAL".',
          variant,
        );
      }

      // ───────────── Cálculo de score con pesos ─────────────
      const mismatches: string[] = [];
      let score = 0;

      // 1) Cédula — OBLIGATORIA. Si no coincide → rechazo inmediato.
      if (frontExtracted.cedula && cedulasMatch(frontExtracted.cedula, formData.cedula)) {
        score += WEIGHT.CEDULA;
      } else {
        return {
          verified: false,
          status: VerificationStatus.REJECTED,
          confidence: 0,
          documentVariant: variant,
          extractedData: this.extractedOf(frontExtracted, backExtracted),
          mismatches: ['El número de cédula del documento no coincide con el ingresado'],
          message: '❌ El número de cédula no coincide con el documento. Revisá que escribiste el mismo número que aparece en tu cédula.',
        };
      }

      // 2) Nombre
      if (frontExtracted.firstName && this.normalize(frontExtracted.firstName).includes(this.normalize(formData.firstName))) {
        score += WEIGHT.FIRST_NAME;
      } else if (frontExtracted.firstName) {
        mismatches.push('Nombre no coincide exactamente');
      }

      // 3) Apellido
      if (frontExtracted.firstLastName && this.normalize(frontExtracted.firstLastName).includes(this.normalize(formData.firstLastName))) {
        score += WEIGHT.LAST_NAME;
      } else if (frontExtracted.firstLastName) {
        mismatches.push('Apellido no coincide exactamente');
      }

      // En la cédula DIGITAL la fecha y el lugar de expedición NO están impresos
      // como texto legible (están codificados en el MRZ). Por eso, si la variante
      // es DIGITAL otorgamos los puntos de fecha/lugar automáticamente como
      // "no aplica" y no penalizamos.
      const isDigital = variant === 'DIGITAL' || (variant === 'UNKNOWN' && backHasDigitalMarkers);

      // 4) Fecha de expedición
      if (isDigital) {
        score += WEIGHT.EXPEDITION_DATE; // no aplica
      } else if (backExtracted.expeditionDate) {
        if (this.datesMatch(backExtracted.expeditionDate, formData.expeditionDate)) {
          score += WEIGHT.EXPEDITION_DATE;
        } else {
          mismatches.push('Fecha de expedición no coincide');
        }
      }

      // 5) Lugar de expedición
      if (isDigital) {
        score += WEIGHT.EXPEDITION_PLACE; // no aplica en digital
      } else if (backExtracted.expeditionPlace) {
        if (this.placesMatch(backExtracted.expeditionPlace, formData.expeditionPlace)) {
          score += WEIGHT.EXPEDITION_PLACE;
        } else {
          mismatches.push('Lugar de expedición no coincide');
        }
      } else {
        // Cédula AMARILLA donde no se pudo leer el lugar.
        mismatches.push('No se pudo leer el lugar de expedición');
      }

      const confidence = Math.round((score / MAX_SCORE) * 100);
      const verified = score >= PASS_THRESHOLD;
      const status = verified ? VerificationStatus.VERIFIED : VerificationStatus.REJECTED;

      this.logger.log(
        `Verificación: cedula=${formData.cedula} variant=${variant} score=${score}/${MAX_SCORE} (${confidence}%) verified=${verified}`,
      );

      if (userId && verified) {
        await this.userRepository.update(userId, { verification_status: status });
        await this.peopleRepo.update(
          { user: { user_id: userId } },
          { document_number: formData.cedula },
        );
      }

      return {
        verified,
        status,
        confidence,
        documentVariant: variant,
        extractedData: this.extractedOf(frontExtracted, backExtracted),
        mismatches,
        message: verified
          ? mismatches.length === 0
            ? '✅ Identidad verificada correctamente'
            : `✅ Identidad verificada (algunos campos no se pudieron leer al 100% pero el documento es válido)`
          : `❌ Verificación incompleta: ${mismatches.join(', ')}. Asegurate de que la foto sea nítida y que los datos del formulario coincidan con tu cédula.`,
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
    });
    await this.peopleRepo.update(
      { user: { user_id: userId } },
      { document_number: documentNumber },
    );
  }

  // ────────────────────── Helpers de extracción IA ──────────────────────

  private async readFront(image: Express.Multer.File) {
    return this.groq.chat.completions.create({
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'image_url', image_url: { url: `data:${image.mimetype};base64,${image.buffer.toString('base64')}` } },
            {
              type: 'text',
              text: `Eres un sistema de verificación de identidad para Colombia.
Analiza la cara FRONTAL de una cédula de ciudadanía colombiana. Hay DOS variantes válidas:

1. CÉDULA AMARILLA (vieja, plastificada con fondo amarillo). Tiene: número de cédula grande, nombres, apellidos, foto a la izquierda.
2. CÉDULA DIGITAL (nueva, 2020+, tipo tarjeta de crédito con chip y QR). Tiene: número de cédula (NUIP), nombres, apellidos, foto, código QR grande, chip.

AMBAS son válidas como documento de identidad.

RESPONDE ÚNICAMENTE con este JSON (sin texto adicional, sin markdown, sin backticks):
{
  "cedula": "número de cédula sin puntos ni espacios (solo dígitos)",
  "firstName": "primer nombre en MAYÚSCULAS",
  "firstLastName": "primer apellido en MAYÚSCULAS",
  "isValidDocument": true,
  "documentVariant": "AMARILLA" o "DIGITAL"
}

Si NO puedes leer un campo claramente, usa null para ese campo (no inventes).
Si la imagen no es la cara frontal de una cédula colombiana válida (amarilla o digital), pon isValidDocument: false y documentVariant: "UNKNOWN".`,
            },
          ],
        },
      ],
      max_tokens: 512,
      temperature: 0.1,
    });
  }

  private async readBack(image: Express.Multer.File) {
    return this.groq.chat.completions.create({
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'image_url', image_url: { url: `data:${image.mimetype};base64,${image.buffer.toString('base64')}` } },
            {
              type: 'text',
              text: `Eres un sistema de verificación de identidad para Colombia.
Analiza el REVERSO de una cédula colombiana. Hay DOS variantes válidas:

1. CÉDULA AMARILLA (vieja): el reverso muestra claramente "FECHA DE EXPEDICIÓN" y "LUGAR DE EXPEDICIÓN" como texto grande, junto con índice dactilar y firma.

2. CÉDULA DIGITAL (nueva, 2020+): el reverso es un PLÁSTICO con:
   - Un QR muy grande en la esquina derecha
   - Un texto pequeño con ".CO" arriba a la izquierda
   - El número de cédula impreso en pequeño en el lado izquierdo (vertical u horizontal)
   - Firma del "REGISTRADOR NACIONAL Alexander Vega Rocha"
   - Una pequeña foto/marca de seguridad
   - 3 líneas de código MRZ al pie con formato: "I<COL...", "ICCOL...", o secuencias con muchos "<"
   - El nombre del titular aparece dentro del MRZ con formato APELLIDOS<<NOMBRES
   - NO tiene fecha ni lugar de expedición como texto legible — están codificados en el MRZ.

AMBAS variantes son válidas como documento de identidad.

Una imagen es VÁLIDA como reverso si tiene CUALQUIERA de estas señales:
  - Texto que diga "FECHA DE EXPEDICIÓN" o "LUGAR DE EXPEDICIÓN" (amarilla)
  - Texto que diga "REGISTRADOR NACIONAL" (cualquier variante)
  - Un código QR grande visible (digital)
  - Un código MRZ con líneas que contengan "COL", "ICCOL" o "I<COL" (digital)
  - El indicio ".CO" o el escudo de Colombia (digital)

RESPONDE ÚNICAMENTE con este JSON (sin texto adicional, sin markdown, sin backticks):
{
  "expeditionDate": "fecha de expedición en formato YYYY-MM-DD si aparece como texto legible, o null si solo está en MRZ o no se ve",
  "expeditionPlace": "ciudad y/o departamento si aparece como texto legible, o null en cualquier otro caso",
  "hasQR": true o false,
  "hasMRZ": true o false (true si ves al menos una línea con COL/ICCOL/I<COL o muchos signos <),
  "isValidDocument": true si cumple cualquiera de las señales del listado anterior, false solo si la imagen claramente NO es una cédula colombiana
}

NO inventes fecha ni lugar. Si solo se ve el MRZ, deja ambos en null pero pon isValidDocument: true.`,
            },
          ],
        },
      ],
      max_tokens: 512,
      temperature: 0.1,
    });
  }

  private parseJson(response: any, side: string): any {
    const raw = response.choices[0]?.message?.content ?? '';
    try {
      const clean = raw.replace(/```json|```/g, '').trim();
      return JSON.parse(clean);
    } catch {
      this.logger.error(`Error parseando respuesta de Groq (${side}):`, raw);
      throw new InternalServerErrorException(`Error procesando la imagen ${side} del documento`);
    }
  }

  private rejection(
    reason: string,
    userMessage: string,
    variant: 'AMARILLA' | 'DIGITAL' | 'UNKNOWN',
  ): VerificationResult {
    return {
      verified: false,
      status: VerificationStatus.REJECTED,
      confidence: 0,
      documentVariant: variant,
      extractedData: {},
      mismatches: [reason],
      message: `❌ ${userMessage}`,
    };
  }

  private extractedOf(front: any, back: any) {
    return {
      cedula: front.cedula,
      firstName: front.firstName,
      firstLastName: front.firstLastName,
      expeditionDate: back.expeditionDate,
      expeditionPlace: back.expeditionPlace,
    };
  }

  private normalize(s: string): string {
    return (s ?? '')
      .toString()
      .toUpperCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .trim();
  }

  /** Compara dos fechas tolerando formatos distintos (YYYY-MM-DD, DD/MM/YYYY, etc.). */
  private datesMatch(a: string, b: string): boolean {
    const parse = (s: string): string => {
      if (!s) return '';
      // YYYY-MM-DD
      const m1 = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(s);
      if (m1) return `${m1[1]}-${m1[2].padStart(2, '0')}-${m1[3].padStart(2, '0')}`;
      // DD/MM/YYYY o DD-MM-YYYY
      const m2 = /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/.exec(s);
      if (m2) return `${m2[3]}-${m2[2].padStart(2, '0')}-${m2[1].padStart(2, '0')}`;
      return s.trim();
    };
    return parse(a) === parse(b) && parse(a) !== '';
  }

  /** Compara dos lugares tolerando "Mocoa, Putumayo" vs "MOCOA". */
  private placesMatch(fromDoc: string, fromForm: string): boolean {
    const norm = (s: string) =>
      this.normalize(s)
        .replace(/[.\-_,]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    const doc = norm(fromDoc);
    const form = norm(fromForm);
    if (!doc || !form) return false;
    // El doc puede traer "MOCOA PUTUMAYO" y el form "MOCOA" → ambos sentidos.
    const cityForm = form.split(' ')[0];
    return doc.includes(cityForm) || form.includes(doc.split(' ')[0]);
  }
}
