// src/auth/infrastructure/controllers/auth.controller.ts
import { Body, Controller, Get, Post, Request, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { LoginDto } from 'src/auth/application/dtos/login/login.dto';
import { RegisterUseCase } from 'src/auth/application/use-cases/register.use-case';
import { LoginUseCase } from 'src/auth/application/use-cases/login.use-case';
import { CreateFullUserDto } from 'src/auth/application/dtos/register/create-full-user.dto';
import { RegisterCourierUseCase } from 'src/auth/application/use-cases/register-courier.use-case';
import { RegisterCourierDto } from 'src/auth/application/dtos/register/register-courier.dto';
import { RegisterVendorUseCase } from 'src/auth/application/use-cases/register-vendor.use-case';
import { RegisterVendorDto } from 'src/auth/application/dtos/register/register-vendor.dto';
import { ResetPasswordDto } from 'src/auth/application/dtos/reset-password/reset-password.dto';
import { ForgotPasswordDto } from 'src/auth/application/dtos/reset-password/forgot-password.dto';
import { ForgotPasswordUseCase } from 'src/auth/application/use-cases/forgot-password.use-case';
import { ResetPasswordUseCase } from 'src/auth/application/use-cases/reset-password.use-case';
import { GoogleAuthGuard } from '../guards/google-auth.guard';
import { GoogleLoginUseCase } from 'src/auth/application/use-cases/google-login.use-case';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { ISessionRepository } from 'src/redis/domain/repositories/session.repository.interface';
import { Inject } from '@nestjs/common';
import { SetPasswordUseCase } from 'src/auth/application/use-cases/set-password.use-case';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly _loginUseCase: LoginUseCase,
    private readonly _registerUseCase: RegisterUseCase,
    private readonly _registerCourierUseCase: RegisterCourierUseCase,
    private readonly _registerVendorUseCase: RegisterVendorUseCase,
    private readonly _forgotPasswordUseCase: ForgotPasswordUseCase,
    private readonly _resetPasswordUseCase: ResetPasswordUseCase,
    private readonly googleLoginUseCase: GoogleLoginUseCase,
    private readonly setPasswordUseCase: SetPasswordUseCase,
    @Inject('ISessionRepository')
    private readonly sessionRepository: ISessionRepository,
    private readonly configService: ConfigService,
  ) {}

  @Post('login')
  @Throttle({ medium: { ttl: 60_000, limit: 5 } }) // máx 5 intentos/min por IP
  @ApiOperation({ summary: 'Inicio de sesión' })
  @ApiResponse({ status: 200, description: 'Login exitoso.' })
  @ApiResponse({ status: 401, description: 'Credenciales incorrectas.' })
  async login(@Body() loginDto: LoginDto) {
    return this._loginUseCase.execute(loginDto);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Cerrar sesión', description: 'Invalida el token en Redis' })
  @ApiResponse({ status: 200, description: 'Sesión cerrada correctamente.' })
  async logout(@Request() req) {
    await this.sessionRepository.delete(req.user.user_id);
    return { message: 'Sesión cerrada correctamente' };
  }

  @Post('register')
  @ApiOperation({ summary: 'Registro de usuario completo' })
  @ApiResponse({ status: 201, description: 'Usuario creado correctamente.' })
  @ApiResponse({ status: 400, description: 'El correo ya existe o datos inválidos.' })
  async register(@Body() dto: CreateFullUserDto) {
    return this._registerUseCase.execute(dto);
  }

  @Post('register-courier')
  @ApiOperation({ summary: 'Registro para Repartidores' })
  @ApiResponse({ status: 201, description: 'Repartidor registrado exitosamente.' })
  @ApiResponse({ status: 400, description: 'Datos inválidos o email ya existente.' })
  async registerCourier(@Body() dto: RegisterCourierDto) {
    return this._registerCourierUseCase.execute(dto);
  }

  @Post('register-vendor')
  @ApiOperation({ summary: 'Registro para Vendedores/Restaurantes' })
  @ApiResponse({ status: 201, description: 'Vendedor registrado exitosamente.' })
  @ApiResponse({ status: 400, description: 'Datos inválidos o email ya existente.' })
  async registerVendor(@Body() dto: RegisterVendorDto) {
    return this._registerVendorUseCase.execute(dto);
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Solicitar código de recuperación' })
  @ApiResponse({ status: 200, description: 'Código enviado.' })
  @ApiResponse({ status: 404, description: 'Correo no registrado.' })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this._forgotPasswordUseCase.execute(dto);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Restablecer contraseña con código' })
  @ApiResponse({ status: 200, description: 'Contraseña cambiada con éxito.' })
  @ApiResponse({ status: 400, description: 'Código inválido o expirado.' })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this._resetPasswordUseCase.execute(dto);
  }

  @Post('set-password')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Establecer contraseña (usuarios de Google sin password)' })
  async setPassword(@Request() req, @Body('new_password') newPassword: string) {
    if (!newPassword || newPassword.length < 6) {
      throw new UnauthorizedException('La contraseña debe tener al menos 6 caracteres');
    }
    return this.setPasswordUseCase.execute(req.user.user_id, newPassword);
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Iniciar sesión con Google' })
  async googleAuth() {}

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Callback de Google OAuth' })
  async googleCallback(@Request() req, @Res() res: Response) {
    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') ?? 'http://localhost:5173';
    try {
      const { access_token } = await this.googleLoginUseCase.execute(req.user);
      return res.redirect(`${frontendUrl}/auth/google/callback?token=${access_token}`);
    } catch (error) {
      const message =
        error instanceof UnauthorizedException
          ? error.message
          : 'No se pudo iniciar sesión con Google';
      return res.redirect(`${frontendUrl}/login?error=${encodeURIComponent(message)}`);
    }
  }
}