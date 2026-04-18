import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt'; // Cambiado para evitar problemas de importación
import { IUserRepository } from '../../../user/domain/repositories/user.repository.interface';
import { LoginDto } from '../dtos/login.dto';

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject('IUserRepository') private readonly _userRepo: IUserRepository,
    private readonly jwtService: JwtService,
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
  
      return {
        access_token: this.jwtService.sign(payload),
        message: 'Login exitoso',
      user: {
        email: user.user_email,
        roles: user.roles
      }
    };
  }
}