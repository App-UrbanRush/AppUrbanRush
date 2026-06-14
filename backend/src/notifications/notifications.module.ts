import { Module } from '@nestjs/common';
import { SearchIndexService } from './infrastructure/services/search-index.service';
import { NotifierFactory } from './infrastructure/services/notifier-factory';
import { SocketNotifier } from './infrastructure/services/socket-notifier';
import { EmailNotifier } from './infrastructure/services/email-notifier';
import { PushNotifier } from './infrastructure/services/push-notifier';
import { NotificationBridge } from './infrastructure/services/notification-bridge';
import { NotificationsGateway } from './infrastructure/gateways/notifications.gateway';
import { SearchController } from './infrastructure/controllers/search.controller';
import { NotificationsController } from './infrastructure/controllers/notifications.controller';
import { CommandInvoker } from './application/commands/command-invoker';

/**
 * Módulo de notificaciones + búsqueda — implementa los patrones:
 *
 *   Creacionales:  Singleton (todo es @Injectable), Factory (NotifierFactory),
 *                  Abstract Factory (creación de adapters por canal),
 *                  Prototype (NotificationTemplates + clone()),
 *                  Builder (Notification constructor)
 *   Estructurales: Adapter (notifiers), Bridge (NotificationBridge),
 *                  Composite (NotificationGroup), Facade (controllers),
 *                  Decorator (decoradores @Get/@Post),
 *                  Proxy (JwtAuthGuard, RolesGuard)
 *   Comporta.:     Strategy (notifiers intercambiables),
 *                  Observer (NotificationsGateway emite eventos),
 *                  Command (ICommand + Invoker + undo), State (templates por nivel),
 *                  Template Method (use-cases)
 *
 *   Estructura de datos: AVL Tree (SearchIndexService)
 *   Concurrencia: Promise.all en broadcast + rebuild de índice
 */
@Module({
  controllers: [SearchController, NotificationsController],
  providers: [
    SearchIndexService,
    NotifierFactory,
    SocketNotifier,
    EmailNotifier,
    PushNotifier,
    NotificationBridge,
    NotificationsGateway,
    CommandInvoker,
  ],
  exports: [NotificationBridge, NotificationsGateway, SearchIndexService],
})
export class NotificationsModule {}
