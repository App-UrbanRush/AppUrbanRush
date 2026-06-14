import { Controller, Get, Post, Put, Body, Param, Req, UseGuards, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { Request } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/infrastructure/guards/roles.guard';
import { Roles, UserRole } from 'src/auth/infrastructure/decorators/roles.decorator';
import { VendorEntity } from 'src/vendor/infrastructure/persistence/entities/vendor.entity';
import { CreateOrderUseCase } from '../../application/use-cases/create-order.use-case';
import { GetOrdersByUserUseCase } from '../../application/use-cases/get-orders-by-user.use-case';
import { GetOrdersByVendorUseCase } from '../../application/use-cases/get-orders-by-vendor.use-case';
import { GetAvailableOrdersUseCase } from '../../application/use-cases/get-available-orders.use-case';
import { GetOrdersByCourierUseCase } from '../../application/use-cases/get-orders-by-courier.use-case';
import { GetOrderByIdUseCase } from '../../application/use-cases/get-order-by-id.use-case';
import { UpdateOrderStatusUseCase } from '../../application/use-cases/update-order-status.use-case';
import { ConfirmDeliveryUseCase } from '../../application/use-cases/confirm-delivery.use-case';
import { GetAllVendorOrdersUseCase } from '../../application/use-cases/get-all-vendor-orders.use-case';
import { GetCourierActiveOrdersUseCase } from '../../application/use-cases/get-courier-active-orders.use-case';
import { GetVendorRecentOrdersUseCase } from '../../application/use-cases/get-vendor-recent-orders.use-case';
import { IOrderRepository } from '../../domain/repositories/order.repository.interface';
import { CreateOrderDto } from '../../application/dtos/create-order.dto';
import { OrderResponseMapper } from '../mappers/order-response.mapper';
import { NotificationBridge } from 'src/notifications/infrastructure/services/notification-bridge';
import { OrderStateMachine } from '../../domain/state/order-state-machine';
import { OrderStatus, Actor } from '../../domain/state/order-state';

interface AuthUser {
  user_id: number;
  user_email: string;
  rolIds: number[];
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendiente',
  ACCEPTED: 'Aceptado',
  PREPARING: 'En preparación',
  READY: 'Listo',
  IN_DELIVERY: 'En delivery',
  DELIVERED: 'Entregado',
  CANCELLED: 'Cancelado',
};

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
    private readonly getAllVendorOrders: GetAllVendorOrdersUseCase,
    private readonly getCourierActiveOrders: GetCourierActiveOrdersUseCase,
    private readonly getVendorRecentOrders: GetVendorRecentOrdersUseCase,
    @Inject('IOrderRepository') private readonly orderRepository: IOrderRepository,
    @InjectRepository(VendorEntity) private readonly vendorRepo: Repository<VendorEntity>,
    private readonly notificationBridge: NotificationBridge,
    private readonly stateMachine: OrderStateMachine,
  ) {}

  /** Endpoint que expone State pattern: acciones disponibles según rol. */
  @Get(':id/available-actions')
  @Roles(UserRole.USER, UserRole.BUSINESS, UserRole.DOMICILIARIO, UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Acciones disponibles para el pedido según el actor (State pattern)' })
  async availableActions(@Param('id') id: string, @Req() req: Request) {
    const order = await this.orderRepository.findById(id);
    if (!order) throw new NotFoundException('Pedido no encontrado');

    const user = req.user as AuthUser;
    const actor: Actor = user.rolIds.includes(UserRole.BUSINESS)
      ? 'VENDOR'
      : user.rolIds.includes(UserRole.DOMICILIARIO)
        ? 'COURIER'
        : 'CUSTOMER';

    return {
      currentStatus: order.status as OrderStatus,
      isFinal: this.stateMachine.isFinal(order.status as OrderStatus),
      actions: this.stateMachine.availableActions(order.status as OrderStatus, actor),
    };
  }

  // Usuario crea el pedido (el dueño recibe su código de entrega)
  @Post()
  @Roles(UserRole.USER)
  @ApiOperation({ summary: 'Crear pedido (usuario)' })
  async create(@Body() dto: CreateOrderDto) {
    const order = await this.createOrder.execute(dto);

    // Notificar al vendor (best-effort, no bloquea respuesta).
    if (order && (order as any).vendor_id) {
      const orderId = (order as any)._id?.toString() || (order as any).order_id;
      const orderShortId = (orderId || '').slice(-6).toUpperCase();

      this.vendorRepo
        .findOne({ where: { vendor_id: (order as any).vendor_id } })
        .then((vendor) => {
          if (!vendor?.user_id) return;
          return this.notificationBridge.notify(
            'vendorOrderUpdate',
            [vendor.user_id],
            'SOCKET',
            {
              body: `Nuevo pedido #${orderShortId} — Pendiente`,
              data: { orderId, newStatus: 'PENDING' },
              level: 'INFO',
            },
          );
        })
        .catch(() => undefined);
    }

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
    const orders = await this.getAllVendorOrders.execute(Number(vendorId));
    return orders;
  }

  // Domiciliario ve pedidos disponibles para reclamar (sin código)
  @Get('available')
  @Roles(UserRole.DOMICILIARIO)
  @ApiOperation({ summary: 'Pedidos disponibles para domiciliarios (READY)' })
  async getAvailableOrders() {
    const orders = await this.getAvailable.execute();
    return orders.map((o) => OrderResponseMapper.toResponse(o));
  }

  // Domiciliario ve pedidos activos para mapa de rutas
  @Get('courier/active')
  @Roles(UserRole.DOMICILIARIO)
  @ApiOperation({ summary: 'Pedidos activos del domiciliario para mapa de rutas' })
  async getActiveOrders(@Req() req: Request) {
    const user = req.user as AuthUser;
    return this.getCourierActiveOrders.execute(user.user_id);
  }

  // Domiciliario ve sus entregas (el código solo aparece en las que están IN_DELIVERY)
  @Get('courier/:courierId')
  @Roles(UserRole.DOMICILIARIO)
  @ApiOperation({ summary: 'Pedidos asignados al domiciliario (sus entregas)' })
  async getByCourierId(@Param('courierId') courierId: string) {
    const id = Number(courierId);
    if (isNaN(id)) {
      throw new BadRequestException('ID de domiciliario inválido');
    }
    const orders = await this.getByCourier.execute(id);
    return orders.map((o: any) => {
      const includeCode = o.courier_id === id && o.status === 'IN_DELIVERY';
      return {
        ...o,
        delivery_code: includeCode ? o.delivery_code : undefined,
      };
    });
  }

  // Detalle de un pedido. El código solo se expone al dueño, al courier
  // asignado en IN_DELIVERY, o al admin.
  @Get(':id')
  @Roles(UserRole.USER, UserRole.DOMICILIARIO, UserRole.ADMIN, UserRole.BUSINESS)
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

    if (order) {
      this.notifyVendorOnStatusChange(id, body.status);
      this.notifyCustomerOnStatusChange(id, body.status);
    }

    return order ? OrderResponseMapper.toResponse(order) : null;
  }

  // Vendor asigna un domiciliario a un pedido READY (mantiene estado READY para que el courier lo acepte)
  @Put(':id/assign-courier')
  @Roles(UserRole.BUSINESS)
  @ApiOperation({ summary: 'Vendor asigna un domiciliario al pedido (mantiene READY)' })
  async assignCourier(
    @Param('id') id: string,
    @Body() body: { courier_id: number },
  ) {
    // Actualizar solo el courier_id sin cambiar el estado
    const order = await this.orderRepository.updateCourier(id, body.courier_id);
    return order ? OrderResponseMapper.toCourierResponse(order, body.courier_id) : null;
  }

  // Domiciliario acepta el pedido disponible: READY→IN_DELIVERY
  @Put(':id/accept')
  @Roles(UserRole.DOMICILIARIO)
  @ApiOperation({ summary: 'Domiciliario acepta el pedido disponible (READY→IN_DELIVERY)' })
  async acceptOrder(
    @Param('id') id: string,
    @Body() body: { courier_id: number },
    @Req() req: Request,
  ) {
    const user = req.user as AuthUser;

    // Validar que el courier no tenga ya un pedido activo
    const courierOrders = await this.orderRepository.findByCourier(user.user_id);
    if (courierOrders.some(o => o.status === 'IN_DELIVERY')) {
      throw new BadRequestException('Ya tienes un pedido en entrega. Finalízalo antes de aceptar otro.');
    }

    // Validar transición usando State pattern (PendingState.canTransitionTo etc.).
    const order = await this.orderRepository.findById(id);
    if (!order) {
      throw new NotFoundException('Pedido no encontrado');
    }
    this.stateMachine.assertCanTransition(order.status as OrderStatus, 'IN_DELIVERY', 'COURIER');
    // Validar que no esté ya asignado a otro courier (race condition)
    if (order.courier_id !== null && order.courier_id !== user.user_id) {
      throw new BadRequestException('El pedido ya fue aceptado por otro domiciliario');
    }
    
    const updated = await this.updateStatus.execute(id, 'IN_DELIVERY', user.user_id);

    // Notificar al cliente que su pedido fue aceptado (best-effort, no bloquea respuesta).
    if (updated?.user_id) {
      this.notificationBridge
        .notify('orderAccepted', [updated.user_id], 'SOCKET', {
          body: `Un domiciliario está en camino. Pedido #${id.slice(-6).toUpperCase()}.`,
          data: { orderId: id, courierId: user.user_id },
        })
        .catch(() => undefined);
    }

    // Notificar al vendor que cambi� el estado
    this.notifyVendorOnStatusChange(id, 'IN_DELIVERY');

    return updated ? OrderResponseMapper.toCourierResponse(updated, user.user_id) : null;
  }

  // Domiciliario cancela el pedido aceptado: IN_DELIVERY→READY
  @Put(':id/cancel')
  @Roles(UserRole.DOMICILIARIO)
  @ApiOperation({ summary: 'Domiciliario cancela el pedido (IN_DELIVERY→READY)' })
  async cancelOrder(
    @Param('id') id: string,
    @Req() req: Request,
  ) {
    const user = req.user as AuthUser;
    
    // Validar que el pedido esté IN_DELIVERY y asignado a este courier
    const order = await this.orderRepository.findById(id);
    if (!order) {
      throw new NotFoundException('Pedido no encontrado');
    }
    if (order.status !== 'IN_DELIVERY') {
      throw new BadRequestException('El pedido no está en entrega');
    }
    if (order.courier_id !== user.user_id) {
      throw new BadRequestException('No tienes permiso para cancelar este pedido');
    }
    
    // Devolver a READY sin courier_id
    const updated = await this.updateStatus.execute(id, 'READY', undefined);

    if (updated) {
      this.notifyVendorOnStatusChange(id, 'READY');
      this.notifyCustomerOnStatusChange(id, 'READY');
    }

    return updated ? OrderResponseMapper.toResponse(updated) : null;
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

    if (order) {
      this.notifyVendorOnStatusChange(id, 'IN_DELIVERY');
      this.notifyCustomerOnStatusChange(id, 'IN_DELIVERY');
    }

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

    // Notificar al cliente que su pedido fue entregado (best-effort).
    if (order?.user_id) {
      this.notificationBridge
        .notify('orderDelivered', [order.user_id], 'SOCKET', {
          body: `Tu pedido #${id.slice(-6).toUpperCase()} fue entregado. ¡Buen provecho!`,
          data: { orderId: id },
        })
        .catch(() => undefined);
    }

    // Notificar al vendor que cambi� el estado
    if (order) {
      this.notifyVendorOnStatusChange(id, 'DELIVERED');
    }

    return order ? OrderResponseMapper.toResponse(order) : null;
  }

  // Vendor obtiene pedidos recientes para el dashboard
  @Get('vendor-dashboard/recent')
  @Roles(UserRole.BUSINESS)
  @ApiOperation({ summary: 'Pedidos recientes para el dashboard del vendor' })
  async fetchVendorRecentOrders(@Req() req: Request) {
    const user = req.user as AuthUser;
    const vendor = await this.vendorRepo.findOne({ where: { user_id: user.user_id } });
    if (!vendor) return [];
    return this.getVendorRecentOrders.execute(vendor.vendor_id);
  }

  private async notifyVendorOnStatusChange(orderId: string, newStatus: string): Promise<void> {
    try {
      const order = await this.orderRepository.findById(orderId);
      if (!order) return;

      const vendor = await this.vendorRepo.findOne({ where: { vendor_id: order.vendor_id } });
      if (!vendor?.user_id) return;

      const statusLabel = STATUS_LABELS[newStatus] || newStatus;
      const orderShortId = orderId.slice(-6).toUpperCase();

      await this.notificationBridge.notify(
        'vendorOrderUpdate',
        [vendor.user_id],
        'SOCKET',
        {
          body: `Pedido #${orderShortId} → ${statusLabel}`,
          data: { orderId, newStatus },
          level: 'INFO',
        },
      );
    } catch {
      // Best-effort, no bloquea la respuesta
    }
  }

  private async notifyCustomerOnStatusChange(orderId: string, newStatus: string): Promise<void> {
    try {
      const order = await this.orderRepository.findById(orderId);
      if (!order?.user_id) return;

      const statusLabel = STATUS_LABELS[newStatus] || newStatus;
      const orderShortId = orderId.slice(-6).toUpperCase();

      await this.notificationBridge.notify(
        'customerOrderUpdate',
        [order.user_id],
        'SOCKET',
        {
          body: `Pedido #${orderShortId} → ${statusLabel}`,
          data: { orderId, newStatus },
          level: 'INFO',
        },
      );
    } catch {
      // Best-effort, no bloquea la respuesta
    }
  }
}
