import { Controller, Get, Param, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/infrastructure/guards/roles.guard';
import { Roles, UserRole } from 'src/auth/infrastructure/decorators/roles.decorator';
import { GetCourierLocationUseCase } from '../../application/use-cases/get-courier-location.use-case';

@ApiTags('Tracking')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('tracking')
export class TrackingController {
  constructor(
    private readonly getCourierLocation: GetCourierLocationUseCase,
  ) {}

  @Get('order/:orderId')
  @Roles(UserRole.USER, UserRole.DOMICILIARIO, UserRole.BUSINESS, UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Última ubicación conocida del domiciliario (fallback REST)' })
  getByOrder(@Param('orderId') orderId: string, @Request() req) {
    return this.getCourierLocation.executeByOrder(
      orderId,
      req.user.user_id,
      req.user.rolIds ?? [],
    );
  }
}
