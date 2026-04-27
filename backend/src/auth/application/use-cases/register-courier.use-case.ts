import { Inject, Injectable, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { User } from 'src/user/domain/entities/user.model';
import { IUserRepository } from 'src/user/domain/repositories/user.repository.interface';
import { RegisterCourierDto } from '../dtos/register/register-courier.dto';
import { ICourierRepository } from 'src/courier/domain/repositories/courier.repository';

@Injectable()
export class RegisterCourierUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    @Inject('ICourierRepository')
    private readonly courierRepository: ICourierRepository,
  ) {}

  async execute(dto: RegisterCourierDto) {
    // Validar si el usuario ya existe
    const existingUser = await this.userRepository.findOneByEmail(dto.user_email);
    if (existingUser) {
      throw new BadRequestException('El correo electrónico ya está registrado');
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(dto.user_password, 10);

    // Crear el objeto de dominio User con el Rol de Repartidor (ID: 3)
    const newUser = new User(
        null,
      dto.user_email,
      hashedPassword,
      [3]  
    );

    // Mapear datos de la persona
    const personData = {
      firstName: dto.firstName,
      firstLastName: dto.firstLastName,
      document_number: dto.document_number,
      cellphone: dto.cellphone,
      address: dto.address,
      gender: dto.gender,
    };

    // PERSISTENCIA: Primero creamos el usuario base
    const savedUser = await this.userRepository.create(newUser, personData);

    if (!savedUser.user_id) {
        throw new Error('Error al recuperar el ID del usuario creado');
      }

    // PERSISTENCIA EXTRA: Guardamos los datos del vehículo en la tabla de couriers
    const courierData = {
      user_id: savedUser.user_id,
      vehicle_type: dto.vehicle_type,
      vehicle_plate: dto.vehicle_plate,
      soat_number: dto.soat_number,
      status: 'PENDING' // Por defecto entra a revisión
    };

    await this.courierRepository.save(courierData);

    return {
      message: 'Registro de repartidor exitoso. Tu cuenta está en revisión.',
      user_id: savedUser.user_id,
    };
  }
}