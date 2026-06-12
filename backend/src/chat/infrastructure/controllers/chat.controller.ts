import { Controller, Get, Param, Patch, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/infrastructure/guards/roles.guard';
import { Roles, UserRole } from 'src/auth/infrastructure/decorators/roles.decorator';
import { GetChatHistoryUseCase } from '../../application/use-cases/get-chat-history.use-case';
import { MarkMessagesReadUseCase } from '../../application/use-cases/mark-messages-read.use-case';
import { GetUnreadCountUseCase } from '../../application/use-cases/get-unread-count.use-case';

@ApiTags('Chat')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('chat')
export class ChatController {
  constructor(
    private readonly getChatHistory: GetChatHistoryUseCase,
    private readonly markMessagesRead: MarkMessagesReadUseCase,
    private readonly getUnreadCount: GetUnreadCountUseCase,
  ) {}

  @Get('order/:orderId')
  @Roles(UserRole.USER, UserRole.DOMICILIARIO)
  @ApiOperation({ summary: 'Obtener historial de chat de un pedido' })
  getHistory(@Param('orderId') orderId: string, @Request() req) {
    return this.getChatHistory.execute(orderId, req.user.user_id);
  }

  @Patch('order/:orderId/read')
  @Roles(UserRole.USER, UserRole.DOMICILIARIO)
  @ApiOperation({ summary: 'Marcar como leídos los mensajes recibidos de un pedido' })
  async markRead(@Param('orderId') orderId: string, @Request() req) {
    await this.markMessagesRead.execute(orderId, req.user.user_id);
    return { ok: true };
  }

  @Get('unread-count/:orderId')
  @Roles(UserRole.USER, UserRole.DOMICILIARIO)
  @ApiOperation({ summary: 'Cantidad de mensajes no leídos de un pedido' })
  unreadCount(@Param('orderId') orderId: string, @Request() req) {
    return this.getUnreadCount.execute(orderId, req.user.user_id);
  }
}
