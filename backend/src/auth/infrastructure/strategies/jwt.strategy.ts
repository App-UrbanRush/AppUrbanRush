import { Injectable, UnauthorizedException, Inject, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { IUserRepository } from 'src/user/domain/repositories/user.repository.interface';
import { JWT_SECRET } from 'src/config/constants';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) implements OnModuleInit {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKeyProvider: (_request, _rawJwtToken, done) => {
        const secret = configService.get<string>(JWT_SECRET);
        if (!secret) {
          done(new Error('JWT_SECRET is not configured'), null);
          return;
        }
        done(null, secret);
      },
    });
  }

  onModuleInit() {
    const secret = this.configService.get<string>(JWT_SECRET);
    if (!secret) {
      throw new Error('JWT_SECRET environment variable is required but not configured');
    }
  }

  async validate(payload: any) {
    const { user_email } = payload;

    // Buscamos al usuario usando nuestra interfaz de repositorio
    const usuario = await this.userRepository.findOneByEmail(user_email);

    if (!usuario) {
      throw new UnauthorizedException('Token no válido o usuario no encontrado');
    }

    // Retornamos el objeto que Nest pegará en request.user
    return {
      user_id: payload.user_id,
      user_email: payload.user_email,
      rolIds: payload.rolIds || [],
      // Agregamos lo que necesitemos en el request
    };
  }
}