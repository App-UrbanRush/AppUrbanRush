// src/auth/application/use-cases/google-login.use-case.ts
import { Injectable, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IUserRepository } from 'src/user/domain/repositories/user.repository.interface';
import { IUserRolesRepository } from 'src/user_rol/domain/repositories/user-roles.repository.interface';
import { ISessionRepository } from 'src/redis/domain/repositories/session.repository.interface';

// Rol por defecto para cuentas creadas vía Google: USER (cliente)
const DEFAULT_GOOGLE_ROLE = 2;

@Injectable()
export class GoogleLoginUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    @Inject('IUserRolesRepository')
    private readonly userRolesRepository: IUserRolesRepository,
    @Inject('ISessionRepository')
    private readonly sessionRepository: ISessionRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(googleUser: {
    google_id: string;
    email: string;
    firstName: string;
    firstLastName: string;
    picture?: string;
  }): Promise<{ access_token: string }> {

    let user = await this.userRepository.findOneByEmail(googleUser.email);

    // Primer inicio con Google: se crea la cuenta automáticamente
    if (!user || user.user_id === null) {
      const newUser = await this.userRepository.createFromGoogle({
        user_email: googleUser.email,
        google_id: googleUser.google_id,
      });

      // Rol por defecto (cliente)
      await this.userRolesRepository.assignRole({
        user_id: newUser.user_id!,
        rol_id: DEFAULT_GOOGLE_ROLE,
      });

      // Persona asociada con el nombre y la foto de Google
      await this.userRepository.savePeople({
        firstName: googleUser.firstName ?? '',
        firstLastName: googleUser.firstLastName ?? '',
        cellphone: '',
        address: '',
        gender: '',
        avatar_url: googleUser.picture ?? null,
        user: { user_id: newUser.user_id },
      });

      user = newUser;
    }

    const roles = await this.userRolesRepository.findByUser(user.user_id!);
    const rolIds = roles.map((r) => r.rol_id);

    const payload = {
      user_id: user.user_id,
      user_email: user.user_email,
      rolIds,
    };

    const access_token = this.jwtService.sign(payload);

    await this.sessionRepository.save(user.user_id!, access_token, 1800); // 30 min

    return { access_token };
  }
}
