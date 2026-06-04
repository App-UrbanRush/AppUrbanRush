import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EncryptedFileEntity } from '../entities/encrypted-file.entity';
import { IEncryptedFileRepository } from '../../../domain/repositories/encrypted-file.repository.interface';
import { EncryptedFileModel } from '../../../domain/entities/encrypted-file.model';
import { EncryptedFileMapper } from '../mappers/encrypted-file.mapper';

@Injectable()
export class TypeormEncryptedFileRepository implements IEncryptedFileRepository {
  constructor(
    @InjectRepository(EncryptedFileEntity)
    private readonly repo: Repository<EncryptedFileEntity>,
  ) {}

  async create(file: EncryptedFileModel): Promise<EncryptedFileModel> {
    const entity = this.repo.create(EncryptedFileMapper.toEntity(file));
    const saved = await this.repo.save(entity);
    return EncryptedFileMapper.toDomain(saved);
  }

  async findById(id: number): Promise<EncryptedFileModel | null> {
    const entity = await this.repo.findOne({ where: { id } });
    return entity ? EncryptedFileMapper.toDomain(entity) : null;
  }

  async findByOwnerId(ownerId: number): Promise<EncryptedFileModel[]> {
    const entities = await this.repo.find({
      where: { owner_id: ownerId },
      order: { created_at: 'DESC' },
    });
    return entities.map(EncryptedFileMapper.toDomain);
  }

  async delete(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}
