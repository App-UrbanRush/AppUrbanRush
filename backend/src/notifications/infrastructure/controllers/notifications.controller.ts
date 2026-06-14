import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/infrastructure/guards/roles.guard';
import { MinRole, UserRole } from 'src/auth/infrastructure/decorators/roles.decorator';
import { NotificationBridge } from '../services/notification-bridge';
import { CommandInvoker } from '../../application/commands/command-invoker';
import { BroadcastAlertCommand } from '../../application/commands/broadcast-alert.command';
import {
  NotificationChannel,
  NotificationLevel,
  NotificationTemplates,
} from '../../domain/entities/notification.model';

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly bridge: NotificationBridge,
    private readonly invoker: CommandInvoker,
  ) {}

  /**
   * Enviar una notificación basada en template (Prototype) por un canal
   * (Bridge + Abstract Factory).
   */
  @Post('send')
  @MinRole(UserRole.ADMIN)
  @ApiOperation({ summary: 'Enviar notificación (template + canal)' })
  async send(
    @Body() body: {
      template: keyof typeof NotificationTemplates;
      userIds: number[];
      channel?: NotificationChannel;
      body?: string;
      level?: NotificationLevel;
    },
  ) {
    await this.bridge.notify(body.template, body.userIds, body.channel ?? 'SOCKET', {
      body: body.body,
      level: body.level,
    });
    return { sent: body.userIds.length };
  }

  /**
   * Emitir alerta global como Command — queda en historial y permite undo.
   */
  @Post('broadcast-alert')
  @MinRole(UserRole.ADMIN)
  @ApiOperation({ summary: 'Broadcast de alerta (Command pattern con undo)' })
  async broadcast(
    @Body() body: { userIds: number[]; title: string; body: string },
    @Request() req,
  ) {
    const cmd = new BroadcastAlertCommand(this.bridge, {
      userIds: body.userIds,
      title: body.title,
      body: body.body,
      issuedBy: req.user.user_email,
    });
    const result = await this.invoker.run(cmd);
    return result;
  }

  @Post('undo-last')
  @MinRole(UserRole.ADMIN)
  @ApiOperation({ summary: 'Deshacer el último comando del invoker' })
  async undo() {
    const result = await this.invoker.undoLast();
    return result ?? { undone: null };
  }
}
