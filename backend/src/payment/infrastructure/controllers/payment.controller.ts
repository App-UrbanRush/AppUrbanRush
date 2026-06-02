import { Controller, Get, Post, Body, Param, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/infrastructure/guards/roles.guard';
import { Roles, UserRole } from 'src/auth/infrastructure/decorators/roles.decorator';
import { CreatePaymentUseCase } from '../../application/use-cases/create-payment.use-case';
import { ConfirmPaymentUseCase } from '../../application/use-cases/confirm-payment.use-case';
import { GetPaymentByOrderUseCase } from '../../application/use-cases/get-payment-by-order.use-case';
import { GetPaymentsByUserUseCase } from '../../application/use-cases/get-payments-by-user.use-case';
import { GetPaymentsByVendorUseCase } from '../../application/use-cases/get-payments-by-vendor.use-case';
import { CreatePaymentDto } from '../../application/dtos/create-payment.dto';
import { WompiWebhookDto } from '../../application/dtos/wompi-webhook.dto';

@ApiTags('Payments')
@Controller('payments')
export class PaymentController {
  constructor(
    private readonly createPayment: CreatePaymentUseCase,
    private readonly confirmPayment: ConfirmPaymentUseCase,
    private readonly getPaymentByOrder: GetPaymentByOrderUseCase,
    private readonly getPaymentsByUser: GetPaymentsByUserUseCase,
    private readonly getPaymentsByVendor: GetPaymentsByVendorUseCase,
  ) {}

  @Post('create')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.USER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear pago para un pedido (usuario)' })
  create(@Body() dto: CreatePaymentDto, @Request() req) {
    return this.createPayment.execute(dto, req.user.user_id); // ← pasar user_id del token
  }

  @Post('webhook')
  @ApiOperation({ summary: 'Webhook de Wompi (público)' })
  webhook(@Body() dto: WompiWebhookDto) {
    return this.confirmPayment.execute(dto);
  }

  @Get('order/:orderId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.USER, UserRole.ADMIN, UserRole.BUSINESS) // ← agregar BUSINESS
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Consultar pago por ID de pedido' })
  getByOrder(@Param('orderId') orderId: string) {
    return this.getPaymentByOrder.execute(orderId);
  }

  @Get('user/:userId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.USER, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Historial de pagos de un usuario' })
  getByUser(@Param('userId') userId: string) {
    return this.getPaymentsByUser.execute(Number(userId));
  }

  @Get('vendor/:vendorId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.BUSINESS, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Liquidaciones de un vendor' })
  getByVendor(@Param('vendorId') vendorId: string) {
    return this.getPaymentsByVendor.execute(Number(vendorId));
  }
}