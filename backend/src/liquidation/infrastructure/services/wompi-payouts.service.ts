import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosError } from 'axios';
import { IPayoutGateway, PayoutResult } from '../../domain/gateways/payout.gateway.interface';
import { BankAccountModel } from '../../domain/entities/bank-account.model';

@Injectable()
export class WompiPayoutsService implements IPayoutGateway {
  private readonly logger = new Logger(WompiPayoutsService.name);
  private readonly baseUrl: string;
  private readonly privateKey: string;
  private readonly payoutsPath: string;

  constructor(private readonly configService: ConfigService) {
    this.baseUrl = this.configService.get<string>('WOMPI_BASE_URL') ?? 'https://sandbox.wompi.co/v1';
    this.privateKey = this.configService.get<string>('WOMPI_PRIVATE_KEY') ?? '';
    // Permite override del endpoint; Wompi llama a este flujo "Dispersiones"
    this.payoutsPath = this.configService.get<string>('WOMPI_PAYOUTS_PATH') ?? '/payouts';
  }

  async executePayout(params: {
    amount: number;
    currency: string;
    reference: string;
    bankAccount: BankAccountModel;
  }): Promise<PayoutResult> {
    const { amount, currency, reference, bankAccount } = params;

    const payload = {
      amount_in_cents: Math.round(amount * 100),
      currency,
      reference,
      beneficiary: {
        full_name: bankAccount.holder_name,
        legal_id_type: bankAccount.holder_document_type,
        legal_id: bankAccount.holder_document_number,
        bank_code: bankAccount.bank_code,
        account_type: bankAccount.account_type === 'SAVINGS' ? 'AHORROS' : 'CORRIENTE',
        account_number: bankAccount.account_number,
      },
    };

    try {
      const response = await axios.post(
        `${this.baseUrl}${this.payoutsPath}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${this.privateKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 20000,
        },
      );

      const data = response.data?.data ?? response.data;
      const status = (data?.status ?? '').toUpperCase();

      if (status === 'APPROVED' || status === 'SUCCESS' || status === 'PENDING') {
        return {
          success: status !== 'FAILED' && status !== 'DECLINED',
          provider_transaction_id: data?.id ?? data?.transaction_id,
          raw: data,
        };
      }

      return {
        success: false,
        provider_transaction_id: data?.id,
        failure_reason: data?.status_message ?? `Estado inesperado: ${status}`,
        raw: data,
      };
    } catch (error) {
      const err = error as AxiosError<any>;
      const reason =
        err.response?.data?.error?.reason ??
        err.response?.data?.error?.message ??
        err.response?.data?.message ??
        err.message;

      this.logger.error(`Error ejecutando payout ${reference}: ${reason}`);

      return {
        success: false,
        failure_reason: reason,
        raw: err.response?.data,
      };
    }
  }

  async getTransactionStatus(providerTransactionId: string) {
    try {
      const response = await axios.get(
        `${this.baseUrl}${this.payoutsPath}/${providerTransactionId}`,
        {
          headers: { Authorization: `Bearer ${this.privateKey}` },
          timeout: 15000,
        },
      );

      const data = response.data?.data ?? response.data;
      const status = (data?.status ?? '').toUpperCase();

      let mapped: 'PENDING' | 'SUCCESS' | 'FAILED' = 'PENDING';
      if (status === 'APPROVED' || status === 'SUCCESS') mapped = 'SUCCESS';
      else if (status === 'FAILED' || status === 'DECLINED' || status === 'ERROR') mapped = 'FAILED';

      return { status: mapped, raw: data };
    } catch (error) {
      this.logger.error(`Error consultando estado de payout ${providerTransactionId}`);
      return { status: 'PENDING' as const };
    }
  }
}
