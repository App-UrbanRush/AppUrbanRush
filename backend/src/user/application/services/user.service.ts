import { Injectable, Inject, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { CreateUserDto } from '../dtos/create-user.dto';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { User } from '../../domain/entities/user.model';

@Injectable()
export class UserService {
  constructor(
    @Inject('IUserRepository') private readonly _userRepository: IUserRepository,
  ) {}

  async create(dto: CreateUserDto): Promise<string> {
    const existe = await this._userRepository.findOneByEmail(dto.user_email);
    if (existe) throw new BadRequestException('El correo ya existe');

    // Creamos la instancia del modelo de dominio
    const newUser = new User(
      null, // ID nulo porque es nuevo
      dto.user_email,
      dto.user_password
    );

    const savedUser = await this._userRepository.save(newUser);

    // Si viene un rol en el DTO, lo asignamos a través del repositorio
    if (dto.rol_id) {
      await this._userRepository.updateUserRole(savedUser.user_id!, dto.rol_id);
    }

    return 'Usuario creado correctamente';
  }

  async obtenerUsuarios() {
    const usuarios = await this._userRepository.findAll();
    return usuarios.map(u => ({
      user_id: u.user_id,
      user_email: u.user_email,
      roles: u.roles // Ya viene como string[] gracias al Mapper
    }));
  }

  async obtenerUsuarioPorId(id: number) {
    const usuario = await this._userRepository.findOneById(id);
    
    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }
  
    return {
      user_id: usuario.user_id,
      user_email: usuario.user_email,
      roles: usuario.roles
    };
  }

  async actualizarUsuario(id: number, dto: UpdateUserDto, currentUser?: any) {
    const usuario = await this._userRepository.findOneById(id);
    if (!usuario) throw new NotFoundException('Usuario no encontrado');

    // Lógica de seguridad
    if (currentUser) {
      const isOwner = id === currentUser.user_id;
      const isAdmin = currentUser.rolIds?.includes(1);
      if (!isOwner && !isAdmin) throw new ForbiddenException('No tienes permisos');
      
      // Solo el admin puede cambiar roles
      if (dto.rol_id && isAdmin) {
        await this._userRepository.updateUserRole(id, dto.rol_id);
      }
    }

    // Actualizamos los campos básicos en el objeto de dominio
    // (Asegúrate de que en user.model.ts no sean 'readonly')
    if (dto.user_email) usuario.user_email = dto.user_email;
    if (dto.user_password) usuario.user_password = dto.user_password;

    await this._userRepository.save(usuario);
    return 'Usuario actualizado correctamente';
  }

  async eliminarUsuario(id: number) {
    const usuario = await this._userRepository.findOneById(id);
    if (!usuario) throw new NotFoundException('El usuario que intentas eliminar no existe');
    
    // El repositorio ahora recibe el ID según la nueva interfaz
    await this._userRepository.remove(id);
    return 'Usuario eliminado correctamente';
  }
}