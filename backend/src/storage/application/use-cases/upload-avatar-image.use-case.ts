import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IPeopleRepository } from 'src/people/domain/repositories/people.repository.interface';

@Injectable()
export class UploadAvatarImageUseCase {
  constructor(
    @Inject('IPeopleRepository')
    private readonly peopleRepo: IPeopleRepository,
  ) {}

  async execute(userId: number, file: Express.Multer.File) {
    const person = await this.peopleRepo.findByUserId(userId);
    if (!person) throw new NotFoundException('Persona no encontrada para este usuario');

    // Imagen embebida (data URI) — no depende de servicios externos
    const dataUri = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;

    person.avatarUrl = dataUri;
    await this.peopleRepo.save(person);

    return { avatar_url: dataUri };
  }
}
