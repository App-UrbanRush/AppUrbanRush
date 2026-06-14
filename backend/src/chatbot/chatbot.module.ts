import { Module, OnModuleInit } from '@nestjs/common';
import { IntentChain } from './domain/chain/intent-chain';
import { ProcessMessageUseCase } from './application/use-cases/process-message.use-case';
import { ChatbotController } from './infrastructure/controllers/chatbot.controller';
import { GreetingHandler } from './infrastructure/handlers/greeting.handler';
import { HowToOrderHandler } from './infrastructure/handlers/how-to-order.handler';
import { RegistrationHandler } from './infrastructure/handlers/registration.handler';
import { PaymentHandler } from './infrastructure/handlers/payment.handler';
import { StoreSearchHandler } from './infrastructure/handlers/store-search.handler';
import { OrderStatusHandler } from './infrastructure/handlers/order-status.handler';
import { CourierInfoHandler } from './infrastructure/handlers/courier-info.handler';
import { VendorInfoHandler } from './infrastructure/handlers/vendor-info.handler';
import { HelpHandler } from './infrastructure/handlers/help.handler';
import { FallbackHandler } from './infrastructure/handlers/fallback.handler';
import { NotificationsModule } from '../notifications/notifications.module';
import { OrderModule } from '../order/order.module';

/**
 * Módulo del Chatbot "Urby".
 *
 * Patrones que demuestra (sumados a los del resto del proyecto):
 *   - Chain of Responsibility   → IntentChain con handlers
 *   - Template Method           → BaseIntentHandler.matches()/handle()
 *   - Strategy                  → un handler por intent, intercambiables
 *   - Singleton                 → todos los handlers + IntentChain
 *   - Facade                    → ChatbotController
 */
@Module({
  imports: [NotificationsModule, OrderModule],
  controllers: [ChatbotController],
  providers: [
    IntentChain,
    ProcessMessageUseCase,
    GreetingHandler,
    HowToOrderHandler,
    RegistrationHandler,
    PaymentHandler,
    StoreSearchHandler,
    OrderStatusHandler,
    CourierInfoHandler,
    VendorInfoHandler,
    HelpHandler,
    FallbackHandler,
  ],
})
export class ChatbotModule implements OnModuleInit {
  constructor(
    private readonly chain: IntentChain,
    private readonly greeting: GreetingHandler,
    private readonly howToOrder: HowToOrderHandler,
    private readonly registration: RegistrationHandler,
    private readonly payment: PaymentHandler,
    private readonly storeSearch: StoreSearchHandler,
    private readonly orderStatus: OrderStatusHandler,
    private readonly courier: CourierInfoHandler,
    private readonly vendor: VendorInfoHandler,
    private readonly help: HelpHandler,
    private readonly fallback: FallbackHandler,
  ) {}

  /**
   * Al arrancar el módulo, encadeno los handlers en el orden de prioridad
   * deseado. El IntentChain elige el de mayor score, así que el orden
   * sólo importa para desempates.
   */
  onModuleInit(): void {
    this.chain
      .register(this.greeting)
      .register(this.orderStatus)  // alta prioridad si está logueado
      .register(this.storeSearch)
      .register(this.howToOrder)
      .register(this.payment)
      .register(this.registration)
      .register(this.courier)
      .register(this.vendor)
      .register(this.help)
      .setFallback(this.fallback);
  }
}
