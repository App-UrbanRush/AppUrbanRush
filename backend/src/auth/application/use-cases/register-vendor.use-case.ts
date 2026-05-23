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
    const existingUser = await this.userRepository.findOneByEmail(dto.user_email);
    if (existingUser) {
      throw new BadRequestException('El correo electrónico ya está registrado');
    }

    if (dto.document_number) {
      const existingDocument = await this.userRepository.findOneByDocumentNumber(dto.document_number);
      if (existingDocument) {
        throw new BadRequestException('El número de documento ya está registrado');
      }
    }

    const hashedPassword = await bcrypt.hash(dto.user_password, 10);

    const newUser = new User(
      null,
      dto.user_email,
      hashedPassword,
      [4],
    );

    const personData = {
      firstName: dto.firstName,
      firstLastName: dto.firstLastName,
      document_number: dto.document_number,
      expedition_date: dto.expedition_date,
      expedition_place: dto.expedition_place,
      cellphone: dto.cellphone,
      address: dto.business_address,
      gender: dto.gender,
    };

    const savedUser = await this.userRepository.create(newUser, personData);

    if (!savedUser.user_id) {
      throw new Error('Error al recuperar el ID del usuario creado');
    }

    await this.vendorRepository.save({
      user_id: savedUser.user_id,
      business_name: dto.business_name,
      business_type: dto.business_type,
      address: dto.business_address,
      phone: dto.business_phone,
      description: dto.description ?? null,
      status: 'VERIFIED',
    });

    return {
      message: 'Registro de vendedor exitoso.',
      user_id: savedUser.user_id,
    };
  }
}
