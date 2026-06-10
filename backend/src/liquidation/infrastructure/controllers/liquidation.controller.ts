import { Controller, Get, Post, Param, Query, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/infrastructure/guards/roles.guard';
import { Roles, UserRole } from 'src/auth/infrastructure/decorators/roles.decorator';
import { GetCourierBalanceUseCase } from '../../application/use-cases/get-courier-balance.use-case';
import { GetVendorBalanceUseCase } from '../../application/use-cases/get-vendor-balance.use-case';
import { ProcessWeeklyLiquidationUseCase } from '../../application/use-cases/process-weekly-liquidation.use-case';
import { GetAdminSummaryUseCase } from '../../application/use-cases/get-admin-summary.use-case';
import { ListMyPayoutsUseCase } from '../../application/use-cases/list-my-payouts.use-case';
import { ListAllPayoutsUseCase } from '../../application/use-cases/list-all-payouts.use-case';
import { RetryPayoutUseCase } from '../../application/use-cases/retry-payout.use-case';
import { PayoutStatus } from '../../domain/entities/payout-transaction.model';

@ApiTags('Liquidation')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('liquidation')
export class LiquidationController {
  constructor(
    private readonly getCourierBalance: GetCourierBalanceUseCase,
    private readonly getVendorBalance: GetVendorBalanceUseCase,
    private readonly processWeekly: ProcessWeeklyLiquidationUseCase,
    private readonly getAdminSummary: GetAdminSummaryUseCase,
    private readonly listMyPayouts: ListMyPayoutsUseCase,
    private readonly listAllPayouts: ListAllPayoutsUseCase,
    private readonly retryPayout: RetryPayoutUseCase,
  ) {}

  @Get('courier/:courierId/balance')
  @Roles(UserRole.DOMICILIARIO, UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Saldo y ganancias del domiciliario' })
  courierBalance(@Param('courierId') courierId: string) {
    return this.getCourierBalance.execute(Number(courierId));
  }

  @Get('courier/:courierId/earnings')
  @Roles(UserRole.DOMICILIARIO, UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Listado de entregas con detalle' })
  async courierEarnings(@Param('courierId') courierId: string) {
    const balance = await this.getCourierBalance.execute(Number(courierId));
    return balance.earnings;
  }

  @Get('vendor/:vendorId/balance')
  @Roles(UserRole.BUSINESS, UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Saldo y ventas del vendor' })
  vendorBalance(@Param('vendorId') vendorId: string) {
    return this.getVendorBalance.execute(Number(vendorId));
  }

  @Get('vendor/:vendorId/sales')
  @Roles(UserRole.BUSINESS, UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Listado de ventas con detalle' })
  async vendorSales(@Param('vendorId') vendorId: string) {
    const balance = await this.getVendorBalance.execute(Number(vendorId));
    return balance.liquidations;
  }

  @Post('process/weekly')
  @Roles(UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Ejecutar liquidación semanal manualmente (SUPERADMIN)' })
  processWeeklyLiquidation() {
    return this.processWeekly.runAll();
  }

  @Get('admin/summary')
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Resumen global de saldos pendientes' })
  adminSummary() {
    return this.getAdminSummary.execute();
  }

  @Get('my-payouts')
  @Roles(UserRole.DOMICILIARIO, UserRole.BUSINESS)
  @ApiOperation({ summary: 'Historial de transferencias recibidas (propias)' })
  myPayouts(@Request() req) {
    return this.listMyPayouts.execute(req.user.user_id);
  }

  @Get('admin/payouts')
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiQuery({ name: 'status', required: false, enum: ['PENDING', 'SUCCESS', 'FAILED'] })
  @ApiOperation({ summary: 'Historial global de transferencias (ADMIN/SUPERADMIN)' })
  allPayouts(@Query('status') status?: PayoutStatus) {
    return this.listAllPayouts.execute(status);
  }

  @Post('admin/payouts/:id/retry')
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Reintentar una transferencia fallida (ADMIN/SUPERADMIN)' })
  retry(@Param('id') id: string) {
    return this.retryPayout.execute(id);
  }
}
