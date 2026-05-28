import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
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
  ) {}

  @Post('login')
  @ApiOperation({ summary: 'Inicio de sesión', description: 'Valida credenciales y devuelve un JWT' })
  @ApiResponse({ status: 200, description: 'Login exitoso.' })
  @ApiResponse({ status: 401, description: 'Credenciales incorrectas.' })
  async login(@Body() loginDto: LoginDto) {
    return this._loginUseCase.execute(loginDto);
  }

  @Post('register')
  @ApiOperation({ summary: 'Registro de usuario completo', description: 'Crea Usuario, Persona y asigna Rol' })
  @ApiResponse({ status: 201, description: 'Usuario creado correctamente.' })
  @ApiResponse({ status: 400, description: 'El correo ya existe o datos inválidos.' })
  async register(@Body() dto: CreateFullUserDto) {
    return this._registerUseCase.execute(dto);
  }


 @Post('register-courier') 
 @ApiOperation({ 
   summary: 'Registro para Repartidores', 
   description: 'Crea cuenta de usuario y perfil de repartidor con datos de vehículo' 
 })
 @ApiResponse({ status: 201, description: 'Repartidor registrado exitosamente.' })
 @ApiResponse({ status: 400, description: 'Datos inválidos o email ya existente.' })
 async registerCourier(@Body() dto: RegisterCourierDto) {
   return this._registerCourierUseCase.execute(dto);
 }

 @Post('register-vendor')
 @ApiOperation({
   summary: 'Registro para Vendedores/Restaurantes',
   description: 'Crea cuenta de usuario y perfil de negocio'
 })
 @ApiResponse({ status: 201, description: 'Vendedor registrado exitosamente.' })
 @ApiResponse({ status: 400, description: 'Datos inválidos o email ya existente.' })
 async registerVendor(@Body() dto: RegisterVendorDto) {
   return this._registerVendorUseCase.execute(dto);
 }
 
 @Post('forgot-password')
  @ApiOperation({ summary: 'Solicitar código de recuperación', description: 'Genera un PIN de 6 dígitos y lo envía por correo' })
  @ApiResponse({ status: 200, description: 'Código enviado.' })
  @ApiResponse({ status: 404, description: 'Correo no registrado.' })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this._forgotPasswordUseCase.execute(dto);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Restablecer contraseña con código', description: 'Valida el PIN y actualiza la contraseña' })
  @ApiResponse({ status: 200, description: 'Contraseña cambiada con éxito.' })
  @ApiResponse({ status: 400, description: 'Código inválido, expirado o datos incorrectos.' })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this._resetPasswordUseCase.execute(dto);
  }

@Get('google')
@UseGuards(GoogleAuthGuard)
@ApiOperation({ summary: 'Iniciar sesión con Google' })
async googleAuth() {
  // Passport redirige automáticamente a Google
}

@Get('google/callback')
@UseGuards(GoogleAuthGuard)
@ApiOperation({ summary: 'Callback de Google OAuth' })
async googleCallback(@Request() req) {
  return this.googleLoginUseCase.execute(req.user);
}

}
