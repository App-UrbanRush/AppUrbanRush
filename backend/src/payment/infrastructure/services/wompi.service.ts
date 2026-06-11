import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as crypto from 'crypto';
import {
  WOMPI_PRIVATE_KEY,
  WOMPI_EVENTS_SECRET,
  WOMPI_BASE_URL,
  WOMPI_PUBLIC_KEY,
  WOMPI_INTEGRITY_SECRET,
} from 'src/config/constants';

export interface WompiTransactionResponse {
  data: {
    id: string;
    status: string;
    reference: string;
    amount_in_cents: number;
    currency: string;
  };
}

@Injectable()
export class WompiService {
  private readonly logger = new Logger(WompiService.name);
  private readonly privateKey: string;
  private readonly eventsSecret: string;
  private readonly baseUrl: string;
  private readonly integritySecret: string; 

  constructor(private readonly configService: ConfigService) {
    this.privateKey = this.configService.get<string>(WOMPI_PRIVATE_KEY) ?? '';
    this.eventsSecret = this.configService.get<string>(WOMPI_EVENTS_SECRET) ?? '';
    this.baseUrl = this.configService.get<string>(WOMPI_BASE_URL) ?? '';
    this.integritySecret = this.configService.get<string>(WOMPI_INTEGRITY_SECRET) ?? ''; 
  }

  // Método para generar la firma de integridad
  private generateSignature(reference: string, amountInCents: number, currency: string): string {
    const concatenated = `${reference}${amountInCents}${currency}${this.integritySecret}`;
    return crypto.createHash('sha256').update(concatenated).digest('hex');
  }

  async createTransaction(
    amountInCents: number,
    currency: string,
    customerEmail: string,
    paymentMethod: Record<string, any>,
    reference: string,
  ): Promise<WompiTransactionResponse> {
    try {
      const { acceptance_token, personal_auth_token } = await this.getAcceptanceTokens();
      const signature = this.generateSignature(reference, amountInCents, currency); 

      const body = {
        amount_in_cents: amountInCents,
        currency,
        customer_email: customerEmail,
        payment_method: paymentMethod,
        reference,
        acceptance_token,
        accept_personal_auth: personal_auth_token,
        signature: signature,
      };

      const response = await axios.post<WompiTransactionResponse>(
        `${this.baseUrl}/transactions`,
        body,
        { headers: { Authorization: `Bearer ${this.privateKey}` } },
      );

      return response.data;

    } catch (error) {
      if (axios.isAxiosError(error)) {
        this.logger.error(`Wompi error: ${error.response?.data?.error?.reason ?? error.message}`);
        const reason = error.response?.data?.error?.reason
          ?? error.response?.data?.message
          ?? error.message;
        throw new InternalServerErrorException(
          `Error al procesar pago con Wompi: ${reason}`
        );
      }
      throw new InternalServerErrorException('Error inesperado al conectar con Wompi');
    }
  }

  validateSignature(
    properties: string[],
    transactionData: Record<string, any>,
    timestamp: number,
    checksum: string,
  ): boolean {
    const values = properties.map((prop) => transactionData[prop]);
    const concatenated = values.join('') + timestamp + this.eventsSecret;
    const hash = crypto.createHash('sha256').update(concatenated).digest('hex');
    return hash === checksum;
  }

  private async getAcceptanceTokens(): Promise<{ acceptance_token: string; personal_auth_token: string }> {
    const response = await axios.get(
      `${this.baseUrl}/merchants/${this.configService.get<string>(WOMPI_PUBLIC_KEY)}`,
    );
    const data = response.data.data;
    return {
      acceptance_token: data.presigned_acceptance.acceptance_token,
      personal_auth_token: data.presigned_personal_data_auth.acceptance_token,
    };
  }
}