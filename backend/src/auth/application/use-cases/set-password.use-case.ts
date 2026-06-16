import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { IUserRepository } from 'src/user/domain/repositories/user.repository.interface';

@Injectable()
export class SetPasswordUseCase {
  constructor(
    @Inject('IUserRepository') private readonly userRepo: IUserRepository,
  ) {}

  async execute(userId: number, newPassword: string): Promise<{ success: boolean; message: string }> {
    const user = await this.userRepo.findOneById(userId);
    if (!user) {
      throw new BadRequestException('Usuario no encontrado');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await this.userRepo.updatePassword(userId, hashedPassword);

    return {
      success: true,
      message: 'Contraseña establecida correctamente',
    };
  }
}
