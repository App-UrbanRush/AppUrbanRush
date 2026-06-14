import { Injectable, Logger } from '@nestjs/common';
import { INotifierAdapter } from '../../domain/structures/notification-composite';
import { Notification } from '../../domain/entities/notification.model';

/** Stub de push (FCM/OneSignal). Concreto del Abstract Factory. */
@Injectable()
export class PushNotifier implements INotifierAdapter {
  private readonly logger = new Logger(PushNotifier.name);

  async send(notification: Notification): Promise<void> {
    this.logger.log(
      `[PUSH ${notification.level}] "${notification.title}" → users=${notification.targetUserIds.join(',')}`,
    );
  }
}
