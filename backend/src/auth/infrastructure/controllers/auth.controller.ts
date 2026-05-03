import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LoginDto } from 'src/auth/application/dtos/login/login.dto';
import { RegisterUseCase } from 'src/auth/application/use-cases/register.use-case';
import { LoginUseCase } from 'src/auth/application/use-cases/login.use-case';
import { CreateFullUserDto } from 'src/auth/application/dtos/register/create-full-user.dto';
import { RegisterCourierUseCase } from 'src/auth/application/use-cases/register-courier.use-case';
import { RegisterCourierDto } from 'src/auth/application/dtos/register/register-courier.dto';
import { RegisterVendorUseCase } from 'src/auth/application/use-cases/register-vendor.use-case';
import { RegisterVendorDto } from 'src/auth/application/dtos/register/register-vendor.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    // Inyectamos los casos de uso por separado
    private readonly _loginUseCase: LoginUseCase,
    private readonly _registerUseCase: RegisterUseCase,
    private readonly _registerCourierUseCase: RegisterCourierUseCase,
    private readonly _registerVendorUseCase: RegisterVendorUseCase,
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
}