import { Controller, Get, Post, Put, Body, Param, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/infrastructure/guards/roles.guard';
import { Roles, UserRole } from 'src/auth/infrastructure/decorators/roles.decorator';
import { CreateOrderUseCase } from '../../application/use-cases/create-order.use-case';
import { GetOrdersByUserUseCase } from '../../application/use-cases/get-orders-by-user.use-case';
import { GetOrdersByVendorUseCase } from '../../application/use-cases/get-orders-by-vendor.use-case';
import { GetAvailableOrdersUseCase } from '../../application/use-cases/get-available-orders.use-case';
import { GetOrdersByCourierUseCase } from '../../application/use-cases/get-orders-by-courier.use-case';
import { GetOrderByIdUseCase } from '../../application/use-cases/get-order-by-id.use-case';
import { UpdateOrderStatusUseCase } from '../../application/use-cases/update-order-status.use-case';
import { ConfirmDeliveryUseCase } from '../../application/use-cases/confirm-delivery.use-case';
import { CreateOrderDto } from '../../application/dtos/create-order.dto';
import { OrderResponseMapper } from '../mappers/order-response.mapper';

interface AuthUser {
  user_id: number;
  user_email: string;
  rolIds: number[];
}

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
    private readonly getByCourier: GetOrdersByCourierUseCase,
    private readonly getById: GetOrderByIdUseCase,
    private readonly updateStatus: UpdateOrderStatusUseCase,
    private readonly confirmDelivery: ConfirmDeliveryUseCase,
  ) {}

  // Usuario crea el pedido (el dueño recibe su código de entrega)
  @Post()
  @Roles(UserRole.USER)
  @ApiOperation({ summary: 'Crear pedido (usuario)' })
  async create(@Body() dto: CreateOrderDto) {
    const order = await this.createOrder.execute(dto);
    return OrderResponseMapper.toResponse(order as any, { includeCode: true });
  }

  // Usuario ve su historial (incluye su código de entrega)
  @Get('user/:userId')
  @Roles(UserRole.USER)
  @ApiOperation({ summary: 'Historial de pedidos del usuario' })
  async getByUserId(@Param('userId') userId: string) {
    const orders = await this.getByUser.execute(Number(userId));
    return orders.map((o) => OrderResponseMapper.toResponse(o, { includeCode: true }));
  }

  // Vendor ve sus pedidos entrantes (sin código)
  @Get('vendor/:vendorId')
  @Roles(UserRole.BUSINESS)
  @ApiOperation({ summary: 'Pedidos recibidos por el vendedor' })
  async getByVendorId(@Param('vendorId') vendorId: string) {
    const orders = await this.getByVendor.execute(Number(vendorId));
    return orders.map((o) => OrderResponseMapper.toResponse(o));
  }

  // Domiciliario ve pedidos disponibles para reclamar (sin código)
  @Get('available')
  @Roles(UserRole.DOMICILIARIO)
  @ApiOperation({ summary: 'Pedidos disponibles para domiciliarios (READY)' })
  async getAvailableOrders() {
    const orders = await this.getAvailable.execute();
    return orders.map((o) => OrderResponseMapper.toResponse(o));
  }

  // Domiciliario ve sus entregas (el código solo aparece en las que están IN_DELIVERY)
  @Get('courier/:courierId')
  @Roles(UserRole.DOMICILIARIO)
  @ApiOperation({ summary: 'Pedidos asignados al domiciliario (sus entregas)' })
  async getByCourierId(@Param('courierId') courierId: string) {
    const id = Number(courierId);
    const orders = await this.getByCourier.execute(id);
    return orders.map((o) => OrderResponseMapper.toCourierResponse(o, id));
  }

  // Detalle de un pedido. El código solo se expone al dueño, al courier
  // asignado en IN_DELIVERY, o al admin.
  @Get(':id')
  @Roles(UserRole.USER, UserRole.DOMICILIARIO, UserRole.ADMIN)
  @ApiOperation({ summary: 'Detalle de un pedido' })
  async getOrderById(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as AuthUser;
    const order = await this.getById.execute(id);

    const isOwner = order.user_id === user.user_id;
    const isAssignedCourier =
      order.courier_id === user.user_id && order.status === 'IN_DELIVERY';
    const isAdmin = user.rolIds?.includes(UserRole.ADMIN);
    const includeCode = isOwner || isAssignedCourier || !!isAdmin;

    return OrderResponseMapper.toResponse(order, { includeCode });
  }

  // Vendor mueve: PENDING→ACCEPTED, ACCEPTED→PREPARING, PREPARING→READY
  @Put(':id/status/vendor')
  @Roles(UserRole.BUSINESS)
  @ApiOperation({ summary: 'Vendor actualiza estado del pedido' })
  async updateVendorStatus(
    @Param('id') id: string,
    @Body() body: { status: 'ACCEPTED' | 'PREPARING' | 'READY' | 'CANCELLED' },
  ) {
    const order = await this.updateStatus.execute(id, body.status);
    return order ? OrderResponseMapper.toResponse(order) : null;
  }

  // Domiciliario reclama el pedido: READY→IN_DELIVERY
  // (DELIVERED ya NO se acepta por aquí; se confirma con código en /deliver)
  @Put(':id/status/courier')
  @Roles(UserRole.DOMICILIARIO)
  @ApiOperation({ summary: 'Domiciliario reclama el pedido (IN_DELIVERY)' })
  async updateCourierStatus(
    @Param('id') id: string,
    @Body() body: { status: 'IN_DELIVERY'; courier_id: number },
  ) {
    const order = await this.updateStatus.execute(id, body.status, body.courier_id);
    return order ? OrderResponseMapper.toCourierResponse(order, body.courier_id) : null;
  }

  // Domiciliario confirma la entrega con el código de 4 dígitos del cliente
  @Put(':id/deliver')
  @Roles(UserRole.DOMICILIARIO)
  @ApiOperation({ summary: 'Confirmar entrega con código (domiciliario)' })
  async deliver(
    @Param('id') id: string,
    @Body() body: { delivery_code: string; courier_id: number },
  ) {
    const order = await this.confirmDelivery.execute(id, body.delivery_code, body.courier_id);
    return order ? OrderResponseMapper.toResponse(order) : null;
  }
}
