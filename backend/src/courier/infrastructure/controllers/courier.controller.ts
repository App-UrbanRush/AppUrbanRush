import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { GetCourierProfileUseCase } from '../../application/use-cases/get-courier-profile.use-case';

@ApiTags('Couriers')
@ApiBearerAuth()
@Controller('couriers')
export class CourierController {
  constructor(
    private readonly getCourierProfileUseCase: GetCourierProfileUseCase,
  ) {}

  @Get(':userId/profile')
  @ApiOperation({ summary: 'Obtener información técnica del repartidor' })
  async getProfile(@Param('userId') userId: number) {
    return this.getCourierProfileUseCase.execute(userId);
  }
}