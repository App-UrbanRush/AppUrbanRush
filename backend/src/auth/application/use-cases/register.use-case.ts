import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { IUserRepository } from '../../../user/domain/repositories/user.repository.interface';
import { CreateFullUserDto } from '../dtos/create-full-user.dto';
import { User } from '../../../user/domain/entities/user.model';

@Injectable()
export class RegisterUseCase {
  constructor(
    @Inject('IUserRepository') 
    private readonly _userRepository: IUserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(userData: CreateFullUserDto): Promise<{ message: string; token: string }> {
    // 1. Validar si ya existe
    const existingUser = await this._userRepository.findOneByEmail(userData.user_email);
    if (existingUser) throw new BadRequestException('El correo ya existe');

    // 2. Encriptar contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.user_password, salt);

    // 3. Crear instancia de dominio
    const userDomain = new User(
      null,
      userData.user_email,
      hashedPassword
    );

    // 4. Guardar usuario (retorna el usuario con su nuevo ID)
    const newUser = await this._userRepository.save(userDomain);

    // 5. Asignar Rol (ID 2 por defecto si no viene ninguno)
    const rolId = (userData.rolIds && userData.rolIds.length > 0) ? userData.rolIds[0] : 2;
    const rol = await this._userRepository.findRolById(rolId);
    if (!rol) throw new BadRequestException('Rol no encontrado');

    await this._userRepository.saveUserRole({
      user: { user_id: newUser.user_id },
      rol: { rol_id: rol.rol_id }
    });

    // 6. Guardar información de la Persona
    await this._userRepository.savePeople({
      ...userData,
      user: { user_id: newUser.user_id }
    });

    // 7. Generar Token
    const payload = {
      user_id: newUser.user_id,
      user_email: newUser.user_email,
      rolIds: [rol.rol_id]
    };

    return {
      message: 'Usuario registrado exitosamente',
      token: this.jwtService.sign(payload)
    };
  }
}