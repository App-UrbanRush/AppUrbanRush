import { Inject, Injectable, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from 'src/user/domain/entities/user.model';
import { IUserRepository } from 'src/user/domain/repositories/user.repository.interface';
import { RegisterCourierDto } from '../dtos/register/register-courier.dto';
import { ICourierRepository } from 'src/courier/domain/repositories/courier.repository';
import { EmailService } from 'src/email/email.service';

@Injectable()
export class RegisterCourierUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    @Inject('ICourierRepository')
    private readonly courierRepository: ICourierRepository,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
  ) {}

  async execute(dto: RegisterCourierDto) {
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
      [3]
    );

    const personData = {
      firstName: dto.firstName,
      firstLastName: dto.firstLastName,
      document_number: dto.document_number,
      cellphone: dto.cellphone,
      address: dto.address,
      gender: dto.gender,
      expedition_date: dto.expedition_date,
      expedition_place: dto.expedition_place,
    };

    const savedUser = await this.userRepository.create(newUser, personData);

    if (!savedUser.user_id) {
        throw new Error('Error al recuperar el ID del usuario creado');
      }

    const courierData = {
      user_id: savedUser.user_id,
      vehicle_type: dto.vehicle_type,
      vehicle_plate: dto.vehicle_plate,
      soat_number: dto.soat_number,
      status: 'PENDING'
    };

    await this.courierRepository.save(courierData);

    const payload = {
      user_id: savedUser.user_id,
      user_email: savedUser.user_email,
      rolIds: [3]
    };

    await this.emailService.sendWelcomeEmail(dto.user_email, dto.firstName);

    return {
      message: 'Registro de repartidor exitoso.',
      user_id: savedUser.user_id,
      user: {
        id: String(savedUser.user_id),
        email: savedUser.user_email,
        name: `${dto.firstName} ${dto.firstLastName}`,
        role: 'courier',
      },
      access_token: this.jwtService.sign(payload),
    };
  }
}