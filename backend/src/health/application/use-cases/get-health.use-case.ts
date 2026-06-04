import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HealthStatus } from '../../domain/interfaces/health.interface';

@Injectable()
export class GetHealthUseCase {
  constructor(private readonly configService: ConfigService) {}

  execute(): HealthStatus {
    return {
      status: 'ok',
      uptime: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
      environment: this.configService.get<string>('NODE_ENV') ?? 'development',
    };
  }
}
