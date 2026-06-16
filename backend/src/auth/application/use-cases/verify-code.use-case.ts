import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { IUserRepository } from 'src/user/domain/repositories/user.repository.interface';
import { VerifyCodeDto } from '../dtos/reset-password/verify-code.dto';

@Injectable()
export class VerifyCodeUseCase {
  constructor(
    @Inject('IUserRepository') private readonly _userRepo: IUserRepository,
  ) {}

  async execute(dto: VerifyCodeDto) {
    const user = await this._userRepo.findOneByEmail(dto.user_email);
    if (!user) {
      throw new BadRequestException('Petición inválida');
    }

    const isValid = await this._userRepo.validateResetCode(dto.user_email, dto.code);
    if (!isValid) {
      throw new BadRequestException('El código de verificación es inválido o ha expirado');
    }

    return { valid: true };
  }
}
