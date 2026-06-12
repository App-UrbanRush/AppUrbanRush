import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JWT_SECRET } from 'src/config/constants';
import { SendMessageUseCase } from '../../application/use-cases/send-message.use-case';
import { GetChatHistoryUseCase } from '../../application/use-cases/get-chat-history.use-case';
import { MarkMessagesReadUseCase } from '../../application/use-cases/mark-messages-read.use-case';
import { MessageType } from '../../domain/entities/message.model';

interface AuthenticatedSocket extends Socket {
  user?: { user_id: number; user_email: string; rolIds: number[] };
}

@WebSocketGateway({
  cors: { origin: '*', credentials: true },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly sendMessage: SendMessageUseCase,
    private readonly getChatHistory: GetChatHistoryUseCase,
    private readonly markMessagesRead: MarkMessagesReadUseCase,
  ) {}

  // ─── Autenticación JWT en conexión ───
  async handleConnection(client: AuthenticatedSocket) {
    try {
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.replace('Bearer ', '');

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

      this.logger.log(`Cliente conectado: ${client.user.user_email} (${client.id})`);
    } catch {
      client.emit('error', { message: 'Token inválido' });
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    this.logger.log(`Cliente desconectado: ${client.user?.user_email ?? client.id}`);
  }

  // ─── Unirse al chat de un pedido ───
  @SubscribeMessage('chat:join')
  async handleJoin(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { order_id: string },
  ) {
    if (!client.user) return;

    const room = `order_${data.order_id}`;
    client.join(room);

    // Cargar historial
    try {
      const history = await this.getChatHistory.execute(data.order_id, client.user.user_id);
      client.emit('chat:history', history);

      // Marcar como leídos los mensajes del otro participante
      await this.markMessagesRead.execute(data.order_id, client.user.user_id);

      this.logger.log(`${client.user.user_email} se unió a ${room}`);
    } catch (error: any) {
      client.emit('error', { message: error.message });
    }
  }

  // ─── Enviar mensaje ───
  @SubscribeMessage('chat:message')
  async handleMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { order_id: string; content: string; type?: string },
  ) {
    if (!client.user) return;

    try {
      const senderRole = this.getRoleName(client.user.rolIds);
      const message = await this.sendMessage.execute(
        data.order_id,
        client.user.user_id,
        senderRole,
        data.content,
        (data.type as MessageType) ?? MessageType.TEXT,
      );

      const room = `order_${data.order_id}`;

      // Emitir a todos en la sala (incluido el sender)
      this.server.to(room).emit('chat:message', message);

      // Avisar a los demás en la sala para que actualicen su badge de no leídos
      client.to(room).emit('chat:unread', {
        order_id: data.order_id,
        sender_id: client.user.user_id,
      });

      this.logger.log(`Mensaje en ${room} de ${client.user.user_email}`);
    } catch (error: any) {
      client.emit('error', { message: error.message });
    }
  }

  // ─── Marcar mensajes como leídos ───
  @SubscribeMessage('chat:read')
  async handleRead(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { order_id: string },
  ) {
    if (!client.user) return;

    try {
      await this.markMessagesRead.execute(data.order_id, client.user.user_id);

      const room = `order_${data.order_id}`;
      client.to(room).emit('chat:read', {
        order_id: data.order_id,
        read_by: client.user.user_id,
      });
    } catch (error: any) {
      client.emit('error', { message: error.message });
    }
  }

  // ─── Indicador "escribiendo…" ───
  @SubscribeMessage('chat:typing')
  handleTyping(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { order_id: string },
  ) {
    if (!client.user) return;
    const room = `order_${data.order_id}`;
    client.to(room).emit('chat:typing', {
      order_id: data.order_id,
      sender_id: client.user.user_id,
    });
  }

  // ─── Cerrar sala cuando pedido pasa a DELIVERED ───
  closeChatRoom(orderId: string) {
    const room = `order_${orderId}`;
    this.server.to(room).emit('chat:closed', {
      order_id: orderId,
      message: 'El pedido fue entregado. Chat cerrado.',
    });
    this.server.in(room).socketsLeave(room);
    this.logger.log(`Chat cerrado para pedido ${orderId}`);
  }

  private getRoleName(rolIds: number[]): string {
    if (rolIds.includes(3)) return 'DOMICILIARIO';
    if (rolIds.includes(2)) return 'USER';
    if (rolIds.includes(4)) return 'BUSINESS';
    return 'UNKNOWN';
  }
}
