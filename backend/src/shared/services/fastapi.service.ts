import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class FastApiService {
  private readonly baseUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.baseUrl = this.configService.get<string>('FASTAPI_BASE_URL') ?? 'http://localhost:8000';
  }

  async estimateDelivery(data: {
    order_id: string;
    vendor_id: number;
    delivery_address: string;
    total_items: number;
  }) {
    try {
      const response = await axios.post(`${this.baseUrl}/delivery-time/estimate`, data);
      return response.data;
    } catch (error) {
      // Si FastAPI está caído, devolver estimación por defecto sin bloquear el pedido
      console.warn('FastAPI no disponible, usando estimación por defecto');
      return { estimated_minutes: 45, confidence: 'LOW', breakdown: {} };
    }
  }

  async analyzeFraud(data: {
    user_id: number;
    order_id: string;
    amount: number;
    payment_method: string;
    delivery_address: string;
  }) {
    try {
      const response = await axios.post(`${this.baseUrl}/fraud/analyze`, data);
      return response.data;
    } catch (error) {
      // Si FastAPI está caído, permitir el pago pero loguear el error
      console.warn('FastAPI no disponible, omitiendo análisis de fraude');
      return { is_suspicious: false, risk_score: 0, reasons: [] };
    }
  }
}