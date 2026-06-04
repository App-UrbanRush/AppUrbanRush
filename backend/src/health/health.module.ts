import { Module } from '@nestjs/common';
import { HealthController } from './infrastructure/controllers/health.controller';
import { GetHealthUseCase } from './application/use-cases/get-health.use-case';

@Module({
  controllers: [HealthController],
  providers: [GetHealthUseCase],
})
export class HealthModule {}
