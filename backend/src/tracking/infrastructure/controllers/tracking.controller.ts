import { Controller, Get, Param, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/infrastructure/guards/roles.guard';
import { Roles, UserRole } from 'src/auth/infrastructure/decorators/roles.decorator';
import { GetCourierLocationUseCase } from '../../application/use-cases/get-courier-location.use-case';
import { GetVendorCourierLocationsUseCase, VendorCourierLocation } from '../../application/use-cases/get-vendor-courier-locations.use-case';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VendorEntity } from 'src/vendor/infrastructure/persistence/entities/vendor.entity';

@ApiTags('Tracking')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('tracking')
export class TrackingController {
  constructor(
    private readonly getCourierLocation: GetCourierLocationUseCase,
    private readonly getVendorCourierLocations: GetVendorCourierLocationsUseCase,
    @InjectRepository(VendorEntity)
    private readonly vendorRepo: Repository<VendorEntity>,
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

  @Get('vendor-couriers')
  @Roles(UserRole.BUSINESS)
  @ApiOperation({ summary: 'Ubicaciones de domiciliarios con pedido activo del negocio' })
  async getVendorCouriers(@Request() req): Promise<VendorCourierLocation[]> {
    const vendor = await this.vendorRepo.findOne({ where: { user_id: req.user.user_id } });
    if (!vendor) return [];
    return this.getVendorCourierLocations.execute(vendor.vendor_id);
  }
}
