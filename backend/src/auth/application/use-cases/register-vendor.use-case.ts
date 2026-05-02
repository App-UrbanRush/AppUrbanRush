import { Inject, Injectable, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { User } from 'src/user/domain/entities/user.model';
import { IUserRepository } from 'src/user/domain/repositories/user.repository.interface';
import { RegisterVendorDto } from '../dtos/register/register-vendor.dto';
import { IVendorRepository } from 'src/vendor/domain/repositories/vendor.repository';

@Injectable()
export class RegisterVendorUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    @Inject('IVendorRepository')
    private readonly vendorRepository: IVendorRepository,
  ) {}

  async execute(dto: RegisterVendorDto) {
    // 1. Validar si el correo ya existe
    const existingUser = await this.userRepository.findOneByEmail(dto.user_email);
    if (existingUser) {
      throw new BadRequestException('El correo electrónico ya está registrado');
    }

    // 2. Encriptar contraseña
    const hashedPassword = await bcrypt.hash(dto.user_password, 10);

    // 3. Crear usuario con rol Empresa (ID: 4)
    const newUser = new User(
      null,
      dto.user_email,
      hashedPassword,
      [4],
    );

    // 4. Datos de la persona
    const personData = {
      firstName: dto.firstName,
      firstLastName: dto.firstLastName,
      document_number: dto.document_number,
      cellphone: dto.cellphone,
      address: dto.address,
      gender: dto.gender,
    };

    // 5. Guardar usuario y persona
    const savedUser = await this.userRepository.create(newUser, personData);

    if (!savedUser.user_id) {
      throw new Error('Error al recuperar el ID del usuario creado');
    }

    // 6. Guardar datos del negocio en tabla vendors
    await this.vendorRepository.save({
      user_id: savedUser.user_id,
      business_name: dto.business_name,
      business_type: dto.business_type,
      address: dto.business_address,
      phone: dto.business_phone,
      description: dto.description ?? null,
      status: 'PENDING',
    });

    return {
      message: 'Registro de vendedor exitoso. Tu cuenta está en revisión.',
      user_id: savedUser.user_id,
    };
  }
}