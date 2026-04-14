import { Injectable, Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { IPeopleRepository } from '../../domain/repositories/people.repository.interface';
import { People } from '../../domain/entities/people.model';
import { UpdatePeopleDto } from '../dtos/update-people.dto';

@Injectable()
export class PeopleService {
  constructor(
    @Inject('IPeopleRepository') private readonly _peopleRepository: IPeopleRepository,
  ) {}

  async obtenerPersonas() {
    const personas = await this._peopleRepository.findAll();
    if (personas.length === 0) throw new NotFoundException('No hay personas registradas');
    return personas;
  }

  async obtenerPersonaPorUserId(userId: number) {
    const persona = await this._peopleRepository.findByUserId(userId);
    if (!persona) throw new NotFoundException('Persona no encontrada para este usuario');
    return persona;
  }

  async obtenerPersonaPorId(id: number) {
    const persona = await this._peopleRepository.findById(id);
    if (!persona) throw new NotFoundException('Persona no encontrada');
    return persona;
  }

  async actualizarPersona(idFromParam: number, dto: UpdatePeopleDto, currentUser: any) {
    const isOwner = Number(idFromParam) === Number(currentUser.user_id);
    const isAdmin = currentUser.rolIds?.includes(1);

    if (!isOwner && !isAdmin) {
      throw new ForbiddenException('No tienes permisos para actualizar esta persona');
    }

    const persona = await this._peopleRepository.findByUserId(idFromParam);
    if (!persona) throw new NotFoundException('Persona no encontrada');

    // Actualización de campos
    if (dto.firstName) persona.firstName = dto.firstName;
    if (dto.firstLastName) persona.firstLastName = dto.firstLastName;
    if (dto.cellphone) persona.cellphone = dto.cellphone;
    if (dto.address) persona.address = dto.address;
    if (dto.gender) persona.gender = dto.gender;

    await this._peopleRepository.save(persona);
    return 'Información de la persona actualizada correctamente';
  }
}