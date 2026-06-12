import {
  Injectable,
  Inject,
  Logger,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IOrderRepository } from '../../domain/repositories/order.repository.interface';
import { UpdateOrderStatusUseCase } from './update-order-status.use-case';
import { EmailService } from 'src/email/email.service';

const MAX_DELIVERY_ATTEMPTS = 3;

@Injectable()
export class ConfirmDeliveryUseCase {
  private readonly logger = new Logger(ConfirmDeliveryUseCase.name);

  constructor(
    @Inject('IOrderRepository') private readonly orderRepository: IOrderRepository,
    private readonly updateOrderStatus: UpdateOrderStatusUseCase,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {}

  async execute(orderId: string, code: string, courierId: number) {
    const order = await this.orderRepository.findById(orderId);
    if (!order) throw new NotFoundException('Pedido no encontrado');

    if (order.delivery_blocked) {
      throw new ForbiddenException(
        'Pedido bloqueado por intentos fallidos. Contacta a soporte.',
      );
    }

    if (order.status !== 'IN_DELIVERY') {
      throw new BadRequestException(
        'Solo se puede confirmar la entrega de un pedido en estado IN_DELIVERY',
      );
    }

    if (order.courier_id !== courierId) {
      throw new ForbiddenException('Este pedido no está asignado a ti');
    }

    // Código correcto → entrega confirmada (reutiliza efectos de DELIVERED)
    if (code === order.delivery_code) {
      return this.updateOrderStatus.execute(orderId, 'DELIVERED', courierId);
    }

    // Código incorrecto → registra intento
    const updated = await this.orderRepository.incrementDeliveryAttempts(orderId);
    const attempts = updated?.delivery_attempts ?? order.delivery_attempts + 1;
    const remaining = Math.max(0, MAX_DELIVERY_ATTEMPTS - attempts);

    if (attempts >= MAX_DELIVERY_ATTEMPTS) {
      await this.orderRepository.block(orderId);
      await this.alertAdmin(orderId, order.courier_id, attempts);
      throw new BadRequestException(
        'Código incorrecto. Se alcanzó el máximo de intentos: el pedido fue bloqueado y se notificó a soporte.',
      );
    }

    throw new BadRequestException(
      `Código incorrecto — verifica con el cliente. Intentos restantes: ${remaining}`,
    );
  }

  private async alertAdmin(orderId: string, courierId: number | null, attempts: number) {
    const adminEmail = this.configService.get<string>('ADMIN_EMAIL');
    this.logger.warn(
      `Pedido ${orderId} bloqueado tras ${attempts} intentos fallidos de código (courier ${courierId}).`,
    );
    if (!adminEmail) {
      this.logger.warn('ADMIN_EMAIL no configurado: no se envió correo de alerta.');
      return;
    }
    try {
      await this.emailService.sendDeliveryFailureAlert(adminEmail, {
        order_id: orderId,
        courier_id: courierId,
        attempts,
      });
    } catch (err) {
      this.logger.error(`No se pudo enviar la alerta de entrega al admin: ${err}`);
    }
  }
}
