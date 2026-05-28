import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IUserRepository } from 'src/user/domain/repositories/user.repository.interface';
import { IUserRolesRepository } from 'src/user_rol/domain/repositories/user-roles.repository.interface';

@Injectable()
export class GoogleLoginUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    @Inject('IUserRolesRepository')
    private readonly userRolesRepository: IUserRolesRepository,
    private readonly jwtService: JwtService,
  ) { }

  async execute(googleUser: {
    google_id: string;
    email: string;
    firstName: string;
    firstLastName: string;
    picture?: string;
  }): Promise<{ access_token: string }> {

    const user = await this.userRepository.findOneByEmail(googleUser.email);

    if (!user || user.user_id === null) {
      throw new UnauthorizedException(
        'No tienes una cuenta registrada. Por favor regístrate primero.',
      );
    }

    const roles = await this.userRolesRepository.findByUser(user.user_id);
    const rolIds = roles.map((r) => r.rol_id);

    const payload = {
      user_id: user.user_id,
      user_email: user.user_email,
      rolIds,
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}