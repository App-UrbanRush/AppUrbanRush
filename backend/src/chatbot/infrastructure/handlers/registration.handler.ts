import { Injectable } from '@nestjs/common';
import { BaseIntentHandler } from '../../domain/chain/base-intent-handler';
import { IncomingMessage, UserAudience } from '../../domain/entities/chat-message.model';
import { ChatResponse } from '../../domain/entities/chat-response.model';

@Injectable()
export class RegistrationHandler extends BaseIntentHandler {
  readonly intent = 'registration';
  protected readonly keywords = [
    'registrarme', 'registro', 'crear cuenta', 'cuenta nueva', 'sign up',
    'inscribirme', 'unirme', 'como me registro', 'ser usuario',
  ];
  protected readonly audiences: UserAudience[] = ['GUEST'];

  protected async respond(_msg: IncomingMessage): Promise<ChatResponse> {
    return {
      reply: 'Podés crear cuenta como cliente, como negocio o como domiciliario. ¿Qué querés ser?',
      intent: this.intent,
      confidence: 1,
      quickReplies: [
        { label: 'Cliente', value: 'Quiero registrarme como cliente' },
        { label: 'Negocio', value: 'Quiero registrarme como negocio' },
        { label: 'Domiciliario', value: 'Quiero registrarme como domiciliario' },
      ],
      actions: [
        { label: 'Ir a registro', type: 'NAVIGATE', target: '/register-select' },
      ],
    };
  }
}
