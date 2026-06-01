import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as crypto from 'crypto';
import {
  WOMPI_PRIVATE_KEY,
  WOMPI_EVENTS_SECRET,
  WOMPI_BASE_URL,
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
  private readonly privateKey: string;
  private readonly eventsSecret: string;
  private readonly baseUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.privateKey = this.configService.get<string>(WOMPI_PRIVATE_KEY) ?? '';
    this.eventsSecret = this.configService.get<string>(WOMPI_EVENTS_SECRET) ?? '';
    this.baseUrl = this.configService.get<string>(WOMPI_BASE_URL) ?? '';
  }

  async createTransaction(
    amountInCents: number,
    currency: string,
    customerEmail: string,
    paymentMethod: Record<string, any>,
    reference: string,
  ): Promise<WompiTransactionResponse> {
    const acceptanceToken = await this.getAcceptanceToken();

    const body = {
      amount_in_cents: amountInCents,
      currency,
      customer_email: customerEmail,
      payment_method: paymentMethod,
      reference,
      acceptance_token: acceptanceToken,
    };

    const response = await axios.post<WompiTransactionResponse>(
      `${this.baseUrl}/transactions`,
      body,
      { headers: { Authorization: `Bearer ${this.privateKey}` } },
    );

    return response.data;
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

  private async getAcceptanceToken(): Promise<string> {
    const response = await axios.get(
      `${this.baseUrl}/merchants/${this.configService.get<string>('WOMPI_PUBLIC_KEY')}`,
    );
    return response.data.data.presigned_acceptance.acceptance_token;
  }
}
