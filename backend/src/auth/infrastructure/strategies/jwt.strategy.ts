// src/auth/infrastructure/strategies/jwt.strategy.ts
import { Injectable, UnauthorizedException, Inject, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { IUserRepository } from 'src/user/domain/repositories/user.repository.interface';
import { ISessionRepository } from 'src/redis/domain/repositories/session.repository.interface';
import { JWT_SECRET } from 'src/config/constants';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) implements OnModuleInit {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    @Inject('ISessionRepository')
    private readonly sessionRepository: ISessionRepository,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      passReqToCallback: true,
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

  async validate(req: Request, payload: any) {
    const token = req.headers['authorization']?.split(' ')[1];
    const storedToken = await this.sessionRepository.find(payload.user_id);

    if (!storedToken || storedToken !== token) {
      throw new UnauthorizedException('Sesión inválida o expirada');
    }

    // Sliding session: reinicia el contador de 30 min en cada request
    await this.sessionRepository.save(payload.user_id, token, 1800);

    return {
      user_id: payload.user_id,
      user_email: payload.user_email,
      rolIds: payload.rolIds,
    };
  }
}