import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LoginDto } from 'src/auth/application/dtos/login.dto';
import { RegisterUseCase } from 'src/auth/application/use-cases/register.use-case';
import { LoginUseCase } from 'src/auth/application/use-cases/login.use-case';
import { CreateFullUserDto } from 'src/auth/application/dtos/create-full-user.dto';


@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    // Inyectamos los casos de uso por separado
    private readonly _loginUseCase: LoginUseCase,
    private readonly _registerUseCase: RegisterUseCase,
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
}