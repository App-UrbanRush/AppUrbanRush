import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { IUserRepository } from 'src/user/domain/repositories/user.repository.interface';
import { ResetPasswordDto } from '../dtos/reset-password/reset-password.dto';

@Injectable()
export class ResetPasswordUseCase {
    constructor(
        @Inject('IUserRepository') private readonly _userRepo: IUserRepository,
    ) { }

    async execute(dto: ResetPasswordDto) {
        const user = await this._userRepo.findOneByEmail(dto.user_email);
        if (!user) {
            throw new BadRequestException('Petición inválida');
        }

        // Validar el código (el repositorio debe verificar coincidencia y que 'expiresAt > NOW()')
        const isCodeValid = await this._userRepo.validateResetCode(dto.user_email, dto.code);
        if (!isCodeValid) {
            throw new BadRequestException('El código de verificación es inválido o ha expirado');
        }

        // Encriptar la nueva contraseña con bcrypt
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(dto.new_password, salt);

        // Actualizar en base de datos
        // Agrega el signo ! después de user_id en ambas líneas
        await this._userRepo.updatePassword(user.user_id!, hashedPassword);

        // Limpiar el código para inhabilitar su reutilización
        await this._userRepo.clearResetCode(user.user_id!,);

        return {
            success: true,
            message: 'Tu contraseña ha sido restablecida correctamente. Ya puedes iniciar sesión.',
        };
    }
}