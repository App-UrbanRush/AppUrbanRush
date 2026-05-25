import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { ForgotPasswordDto } from '../dtos/reset-password/forgot-password.dto';
import { EmailService } from 'src/email/email.service';
import { IUserRepository } from 'src/user/domain/repositories/user.repository.interface';

@Injectable()
export class ForgotPasswordUseCase {
  constructor(
    @Inject('IUserRepository') private readonly _userRepo: IUserRepository,
    private readonly _emailService: EmailService,
  ) {}

  async execute(dto: ForgotPasswordDto) {
    // 1. Buscar el usuario básico por su correo
    const user = await this._userRepo.findOneByEmail(dto.user_email);
    
    if (!user) {
      throw new NotFoundException('El correo electrónico no está registrado');
    }

    // 2. Obtener el primer nombre real registrado en la plataforma
    const registeredFirstName = await this._userRepo.getPersonFirstNameByUserId(user.user_id!);
    
    // Si lo encuentra en la tabla de personas usa ese, de lo contrario un fallback genérico y limpio
    const displayName = registeredFirstName ? registeredFirstName : 'Usuario';

    // 3. Generar un código aleatorio de 6 dígitos numéricos
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // El código expirará en 30 minutos
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 30);

    // 4. Guardar el código en la base de datos
    await this._userRepo.saveResetCode(user.user_id!, resetCode, expiresAt);

    // 5. Despachar el correo electrónico usando el EmailService
    await this._emailService.sendPasswordResetEmail(user.user_email, displayName, resetCode);

    return {
      success: true,
      message: 'Código de recuperación enviado exitosamente a tu correo.',
    };
  }
}