import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { IStorageRepository } from '../../domain/repositories/storage.repository.interface';
import { IPeopleRepository } from 'src/people/domain/repositories/people.repository.interface';

@Injectable()
export class UploadAvatarImageUseCase {
  constructor(
    @Inject('IStorageRepository')
    private readonly storageRepo: IStorageRepository,
    @Inject('IPeopleRepository')
    private readonly peopleRepo: IPeopleRepository,
  ) {}

  async execute(userId: number, file: Express.Multer.File) {
    const person = await this.peopleRepo.findByUserId(userId);
    if (!person) throw new NotFoundException('Persona no encontrada para este usuario');

    const filename = `avatar-${userId}-${randomUUID()}`;
    const result = await this.storageRepo.uploadImage(file.buffer, 'people/avatars', filename);

    person.avatarUrl = result.secure_url;
    await this.peopleRepo.save(person);

    return { avatar_url: result.secure_url, public_id: result.public_id };
  }
}
