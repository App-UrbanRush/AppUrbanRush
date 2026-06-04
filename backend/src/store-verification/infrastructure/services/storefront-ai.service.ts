import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Groq from 'groq-sdk';

export interface StorefrontAIResult {
  detected_text: string;
  is_real_sign: boolean;
  name_matches: boolean;
  confidence: number;
  reasons: string[];
}

@Injectable()
export class StorefrontAIService {
  private readonly logger = new Logger(StorefrontAIService.name);
  private readonly groq: Groq;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('GROQ_API_KEY') ?? '';
    this.groq = new Groq({ apiKey });
  }

  async analyzeStorefront(imageBuffer: Buffer, mimeType: string, expectedName: string): Promise<StorefrontAIResult> {
    const base64 = imageBuffer.toString('base64');

    try {
      const response = await this.groq.chat.completions.create({
        model: 'meta-llama/llama-4-scout-17b-16e-instruct',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: { url: `data:${mimeType};base64,${base64}` },
              },
              {
                type: 'text',
                text: `Eres un sistema de verificación de negocios para una plataforma de delivery en Colombia.

Analiza esta imagen y determina:
1. ¿Es una foto REAL de un letrero o fachada de un local comercial? (no una captura de pantalla, no una imagen de internet, no un logo digital)
2. ¿Qué texto puedes leer en el letrero?
3. ¿El texto del letrero coincide o es similar al nombre comercial esperado: "${expectedName}"?

RESPONDE ÚNICAMENTE con este JSON (sin texto adicional, sin markdown, sin backticks):
{
  "detected_text": "texto que se lee en el letrero",
  "is_real_sign": true,
  "name_matches": true,
  "confidence": 85,
  "reasons": ["razón 1", "razón 2"]
}

Reglas:
- confidence es un número de 0 a 100
- is_real_sign es false si parece una captura de pantalla, imagen de Google, logo digital, o no se ve un local físico
- name_matches es true si el texto detectado es igual o muy similar al nombre esperado (ignorar mayúsculas/minúsculas y acentos)
- reasons debe explicar por qué aprobaste o rechazaste
- Si no puedes leer ningún texto, pon detected_text como "" y confidence bajo`,
              },
            ],
          },
        ],
        max_tokens: 512,
        temperature: 0.1,
      });

      const rawText = response.choices[0]?.message?.content ?? '';

      let parsed: any;
      try {
        const clean = rawText.replace(/```json|```/g, '').trim();
        parsed = JSON.parse(clean);
      } catch {
        this.logger.error('Error parseando respuesta de Groq:', rawText);
        throw new InternalServerErrorException('Error procesando la imagen del local');
      }

      return {
        detected_text: parsed.detected_text ?? '',
        is_real_sign: !!parsed.is_real_sign,
        name_matches: !!parsed.name_matches,
        confidence: Number(parsed.confidence) || 0,
        reasons: Array.isArray(parsed.reasons) ? parsed.reasons : [],
      };
    } catch (error) {
      if (error instanceof InternalServerErrorException) throw error;
      this.logger.error('Error llamando a Groq Vision:', error);
      throw new InternalServerErrorException('Error al analizar la imagen del local');
    }
  }
}
