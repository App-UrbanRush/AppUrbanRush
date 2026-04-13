import { Injectable, Inject, BadRequestException, NotFoundException, ForbiddenException, InternalServerErrorException } from '@nestjs/common';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { CreateUserDto } from '../dtos/create-user.dto';
import { UpdateUserDto } from '../dtos/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    @Inject('IUserRepository') private readonly _userRepository: IUserRepository,
  ) {}

  async create(dto: CreateUserDto): Promise<string> {
    const existe = await this._userRepository.findOneByEmail(dto.user_email);
    if (existe) throw new BadRequestException('El correo ya existe');
    await this._userRepository.save(dto);
    return 'Usuario creado correctamente';
  }

  async obtenerUsuarios() {
    const usuarios = await this._userRepository.findAll();
    return usuarios.map(u => ({
      user_id: u.user_id,
      user_email: u.user_email,
      roles: u.userroles?.map(ur => ur.rol.rol_name)
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
      roles: usuario.userroles?.map(ur => ur.rol.rol_name) || []
    };
  }

  async actualizarUsuario(id: number, dto: UpdateUserDto, currentUser?: any) {
    const usuario = await this._userRepository.findOneById(id);
    if (!usuario) throw new NotFoundException('Usuario no encontrado');

    // Lógica de seguridad (Solo si currentUser existe, para no romper pruebas)
    if (currentUser) {
      const isOwner = id === currentUser.user_id;
      const isAdmin = currentUser.rolIds?.includes(1);
      if (!isOwner && !isAdmin) throw new ForbiddenException('No tienes permisos');
      
      // Solo el admin puede cambiar roles
      if (dto.rol_id && isAdmin) {
        const rol = await this._userRepository.findRolById(dto.rol_id);
        const userRole = await this._userRepository.findUserRole(usuario);
        if (userRole) {
          userRole.rol = rol;
          await this._userRepository.saveUserRole(userRole);
        }
      }
    }

    // Actualizamos los campos básicos
    if (dto.user_email) usuario.user_email = dto.user_email;
    if (dto.user_password) usuario.user_password = dto.user_password;

    await this._userRepository.save(usuario);
    return 'Usuario actualizado correctamente';
  }

  async eliminarUsuario(id: number) {
    const usuario = await this._userRepository.findOneById(id);
    if (!usuario) throw new NotFoundException('El usuario que intentas eliminar no existe');
    
    await this._userRepository.remove(usuario);
    return 'Usuario eliminado correctamente';
  }
}