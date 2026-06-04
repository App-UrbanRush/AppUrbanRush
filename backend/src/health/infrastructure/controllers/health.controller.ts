import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { GetHealthUseCase } from '../../application/use-cases/get-health.use-case';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly getHealth: GetHealthUseCase) {}

  @Get()
  @ApiOperation({ summary: 'Health check — estado del servidor' })
  check() {
    return this.getHealth.execute();
  }
}
