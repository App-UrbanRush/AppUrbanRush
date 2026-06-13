import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Logger, Inject } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JWT_SECRET } from 'src/config/constants';
import { UpdateLocationUseCase } from '../../application/use-cases/update-location.use-case';
import { GetCourierLocationUseCase } from '../../application/use-cases/get-courier-location.use-case';
import { IOrderRepository } from 'src/order/domain/repositories/order.repository.interface';
import { UpdateLocationDto } from '../../application/dtos/update-location.dto';

interface AuthSocket extends Socket {
  user?: { user_id: number; user_email: string; rolIds: number[] };
}

@WebSocketGateway({
  cors: { origin: '*', credentials: true },
  namespace: '/tracking',
})
export class GPSGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(GPSGateway.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly updateLocation: UpdateLocationUseCase,
    private readonly getCourierLocation: GetCourierLocationUseCase,
    @Inject('IOrderRepository')
    private readonly orderRepo: IOrderRepository,
  ) {}

  async handleConnection(client: AuthSocket) {
    try {
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.toString().replace('Bearer ', '');

      if (!token) {
        client.emit('error', { message: 'Token no proporcionado' });
        client.disconnect();
        return;
      }

      const secret = this.configService.get<string>(JWT_SECRET);
      const payload = this.jwtService.verify(token, { secret });
      client.user = {
        user_id: payload.user_id,
        user_email: payload.user_email,
        rolIds: payload.rolIds,
      };

      this.logger.log(`Tracking conectado: ${client.user.user_email} (${client.id})`);
    } catch {
      client.emit('error', { message: 'Token inválido' });
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthSocket) {
    this.logger.log(`Tracking desconectado: ${client.user?.user_email ?? client.id}`);
  }

  // ─── Usuario / vendor / admin se suscribe al tracking de un pedido ───
  @SubscribeMessage('order:tracking')
  async handleSubscribe(
    @ConnectedSocket() client: AuthSocket,
    @MessageBody() data: { order_id: string },
  ) {
    if (!client.user) return;

    try {
      const order = await this.orderRepo.findById(data.order_id);
      if (!order) {
        client.emit('error', { message: 'Pedido no encontrado' });
        return;
      }

      const isOwner = order.user_id === client.user.user_id;
      const isAdmin = client.user.rolIds.includes(1) || client.user.rolIds.includes(5);
      const isCourier = client.user.rolIds.includes(3);
      const isBusiness = client.user.rolIds.includes(4);

      if (!isOwner && !isAdmin && !isCourier && !isBusiness) {
        client.emit('error', { message: 'No autorizado' });
        return;
      }

      const room = this.trackingRoom(data.order_id);
      client.join(room);

      // Enviar última ubicación conocida al unirse
      if (order.courier_id !== null) {
        const lastLocation = await this.getCourierLocation.executeByCourier(order.courier_id);
        if (lastLocation) {
          client.emit('courier:location', {
            order_id: data.order_id,
            courier_id: lastLocation.courier_id,
            lat: lastLocation.lat,
            lng: lastLocation.lng,
            accuracy: lastLocation.accuracy,
            speed: lastLocation.speed,
            heading: lastLocation.heading,
            timestamp: lastLocation.timestamp,
          });
        }
      }

      client.emit('tracking:subscribed', { order_id: data.order_id, status: order.status });
      this.logger.log(`${client.user.user_email} suscrito a ${room}`);
    } catch (error: any) {
      client.emit('error', { message: error.message });
    }
  }

  // ─── Domiciliario envía su ubicación ───
  @SubscribeMessage('courier:location:update')
  async handleLocationUpdate(
    @ConnectedSocket() client: AuthSocket,
    @MessageBody() data: UpdateLocationDto,
  ) {
    if (!client.user) return;

    if (!client.user.rolIds.includes(3)) {
      client.emit('error', { message: 'Solo domiciliarios pueden enviar ubicación' });
      return;
    }

    try {
      const location = await this.updateLocation.execute(client.user.user_id, data);

      const room = this.trackingRoom(data.order_id);
      this.server.to(room).emit('courier:location', {
        order_id: data.order_id,
        courier_id: location.courier_id,
        lat: location.lat,
        lng: location.lng,
        accuracy: location.accuracy,
        speed: location.speed,
        heading: location.heading,
        timestamp: location.timestamp,
      });

      client.emit('location:saved', { ok: true, timestamp: location.timestamp });
    } catch (error: any) {
      client.emit('error', { message: error.message });
    }
  }

  // ─── Llamado desde UpdateOrderStatusUseCase cuando llega a DELIVERED ───
  closeTrackingRoom(orderId: string) {
    const room = this.trackingRoom(orderId);
    this.server.to(room).emit('tracking:closed', {
      order_id: orderId,
      message: 'El pedido fue entregado. Tracking finalizado.',
    });
    this.server.in(room).socketsLeave(room);
    this.logger.log(`Tracking cerrado para pedido ${orderId}`);
  }

  private trackingRoom(orderId: string): string {
    return `tracking_order_${orderId}`;
  }

  emitVendorStatsUpdate(vendorId: number, stats: { domiciliariosActivos: number }) {
    const room = `vendor_${vendorId}`;
    this.server.to(room).emit('vendor:stats:update', stats);
  }

  joinVendorRoom(client: Socket, vendorId: number) {
    client.join(`vendor_${vendorId}`);
  }
}
