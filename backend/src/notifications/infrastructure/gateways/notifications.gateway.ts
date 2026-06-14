import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

/**
 * Gateway de notificaciones — namespace dedicado `/notifications`.
 *
 * Cada cliente se registra con su userId al conectarse, y el servidor
 * mantiene un mapa userId -> Set<socketId> para emitir solo a las
 * sesiones de ese usuario (multi-pestaña soportado).
 *
 * El método público `emitToUsers()` lo usa SocketNotifier (Abstract Factory).
 */
@WebSocketGateway({
  namespace: '/notifications',
  cors: { origin: '*', credentials: true },
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(NotificationsGateway.name);

  @WebSocketServer()
  server!: Server;

  private readonly userSockets = new Map<number, Set<string>>();

  handleConnection(client: Socket): void {
    this.logger.log(`Cliente conectado: ${client.id}`);
  }

  handleDisconnect(client: Socket): void {
    for (const [userId, sockets] of this.userSockets.entries()) {
      if (sockets.delete(client.id) && sockets.size === 0) {
        this.userSockets.delete(userId);
      }
    }
    this.logger.log(`Cliente desconectado: ${client.id}`);
  }

  @SubscribeMessage('register')
  onRegister(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { userId: number },
  ): { ok: boolean } {
    if (!payload?.userId) return { ok: false };
    const set = this.userSockets.get(payload.userId) ?? new Set<string>();
    set.add(client.id);
    this.userSockets.set(payload.userId, set);
    return { ok: true };
  }

  /**
   * Emisión a múltiples usuarios en paralelo (Promise.all).
   * Lo invoca SocketNotifier desde el Abstract Factory.
   */
  async emitToUsers(userIds: number[], payload: unknown): Promise<void> {
    await Promise.all(
      userIds.map(async (uid) => {
        const sockets = this.userSockets.get(uid);
        if (!sockets) return;
        for (const sid of sockets) {
          this.server.to(sid).emit('notification', payload);
        }
      }),
    );
  }
}
