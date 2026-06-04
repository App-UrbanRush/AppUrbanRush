import { Controller, Get, Param, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/infrastructure/guards/roles.guard';
import { Roles, UserRole } from 'src/auth/infrastructure/decorators/roles.decorator';
import { GetChatHistoryUseCase } from '../../application/use-cases/get-chat-history.use-case';

@ApiTags('Chat')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('chat')
export class ChatController {
  constructor(private readonly getChatHistory: GetChatHistoryUseCase) {}

  @Get('order/:orderId')
  @Roles(UserRole.USER, UserRole.DOMICILIARIO)
  @ApiOperation({ summary: 'Obtener historial de chat de un pedido' })
  getHistory(@Param('orderId') orderId: string, @Request() req) {
    return this.getChatHistory.execute(orderId, req.user.user_id);
  }
}
