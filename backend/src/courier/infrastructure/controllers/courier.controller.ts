import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { GetCourierProfileUseCase } from '../../application/use-cases/get-courier-profile.use-case';
import { JwtAuthGuard } from 'src/auth/infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/infrastructure/guards/roles.guard';
import { Roles } from 'src/auth/infrastructure/decorators/roles.decorator';

@ApiTags('Couriers')
@ApiBearerAuth()
@Controller('couriers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CourierController {
  constructor(
    private readonly getCourierProfileUseCase: GetCourierProfileUseCase,
  ) {}

  @Get(':userId/profile')
  @Roles(1, 3)
  @ApiOperation({ summary: 'Obtener información técnica del repartidor' })
  async getProfile(@Param('userId') userId: number) {
    return this.getCourierProfileUseCase.execute(userId);
  }
}