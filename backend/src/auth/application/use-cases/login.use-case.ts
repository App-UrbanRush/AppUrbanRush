import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt'; 
import { IUserRepository } from '../../../user/domain/repositories/user.repository.interface';
import { LoginDto } from '../dtos/login/login.dto';
import { ISessionRepository } from 'src/redis/domain/repositories/session.repository.interface';

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject('IUserRepository') private readonly _userRepo: IUserRepository,
    private readonly jwtService: JwtService,
    @Inject('ISessionRepository')
    private readonly sessionRepository: ISessionRepository,
  ) {}

  async execute(dto: LoginDto) {
    const user = await this._userRepo.findOneByEmail(dto.user_email);
    
    if (!user || !user.user_password) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    const passwordOK = await bcrypt.compare(dto.user_password, user.user_password);

    if (!passwordOK) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    const payload = { 
      user_id: user.user_id, 
      user_email: user.user_email,
      rolIds: user.roles || [] 
    };

    const access_token = this.jwtService.sign(payload); // ← separar para usarlo abajo

    await this.sessionRepository.save(user.user_id!, access_token, 1800); // ← aquí dentro

    return {
      access_token,
      message: 'Login exitoso',
      user: {
        email: user.user_email,
        roles: user.roles
      }
    };
  }
}