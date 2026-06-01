import { Controller, Get, Post, Put, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/infrastructure/guards/roles.guard';
import { Roles, UserRole } from 'src/auth/infrastructure/decorators/roles.decorator';
import { CreateOrderUseCase } from '../../application/use-cases/create-order.use-case';
import { GetOrdersByUserUseCase } from '../../application/use-cases/get-orders-by-user.use-case';
import { GetOrdersByVendorUseCase } from '../../application/use-cases/get-orders-by-vendor.use-case';
import { GetAvailableOrdersUseCase } from '../../application/use-cases/get-available-orders.use-case';
import { UpdateOrderStatusUseCase } from '../../application/use-cases/update-order-status.use-case';
import { CreateOrderDto } from '../../application/dtos/create-order.dto';

@ApiTags('Orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('orders')
export class OrderController {
  constructor(
    private readonly createOrder: CreateOrderUseCase,
    private readonly getByUser: GetOrdersByUserUseCase,
    private readonly getByVendor: GetOrdersByVendorUseCase,
    private readonly getAvailable: GetAvailableOrdersUseCase,
    private readonly updateStatus: UpdateOrderStatusUseCase,
  ) {}

  // Usuario crea el pedido
  @Post()
  @Roles(UserRole.USER)
  @ApiOperation({ summary: 'Crear pedido (usuario)' })
  create(@Body() dto: CreateOrderDto) {
    return this.createOrder.execute(dto);
  }

  // Usuario ve su historial
  @Get('user/:userId')
  @Roles(UserRole.USER)
  @ApiOperation({ summary: 'Historial de pedidos del usuario' })
  getByUserId(@Param('userId') userId: string) {
    return this.getByUser.execute(Number(userId));
  }

  // Vendor ve sus pedidos entrantes
  @Get('vendor/:vendorId')
  @Roles(UserRole.BUSINESS)
  @ApiOperation({ summary: 'Pedidos recibidos por el vendedor' })
  getByVendorId(@Param('vendorId') vendorId: string) {
    return this.getByVendor.execute(Number(vendorId));
  }

  // Domiciliario ve pedidos disponibles para reclamar
  @Get('available')
  @Roles(UserRole.DOMICILIARIO)
  @ApiOperation({ summary: 'Pedidos disponibles para domiciliarios (READY)' })
  getAvailableOrders() {
    return this.getAvailable.execute();
  }

  // Vendor mueve: PENDING→ACCEPTED, ACCEPTED→PREPARING, PREPARING→READY
  @Put(':id/status/vendor')
  @Roles(UserRole.BUSINESS)
  @ApiOperation({ summary: 'Vendor actualiza estado del pedido' })
  updateVendorStatus(
    @Param('id') id: string,
    @Body() body: { status: 'ACCEPTED' | 'PREPARING' | 'READY' | 'CANCELLED' },
  ) {
    return this.updateStatus.execute(id, body.status);
  }

  // Domiciliario mueve: READY→IN_DELIVERY, IN_DELIVERY→DELIVERED
  @Put(':id/status/courier')
  @Roles(UserRole.DOMICILIARIO)
  @ApiOperation({ summary: 'Domiciliario actualiza estado del pedido' })
  updateCourierStatus(
    @Param('id') id: string,
    @Body() body: { status: 'IN_DELIVERY' | 'DELIVERED'; courier_id: number },
  ) {
    return this.updateStatus.execute(id, body.status, body.courier_id);
  }
}