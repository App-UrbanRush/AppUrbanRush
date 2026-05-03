import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IVendorRepository } from 'src/vendor/domain/repositories/vendor.repository';
import { VendorEntity } from '../entities/vendor.entity';
import { Vendor } from 'src/vendor/domain/entities/vendor.model';
import { VendorMapper } from '../mappers/vendor.mapper';

@Injectable()
export class TypeOrmVendorRepository implements IVendorRepository {
  constructor(
    @InjectRepository(VendorEntity)
    private readonly repository: Repository<VendorEntity>,
  ) {}

  async save(vendor: Partial<Vendor>): Promise<Vendor> {
    const entityData = {
      ...vendor,
      vendor_id: vendor.vendor_id ?? undefined,
    };

    const entity = this.repository.create(entityData as any);
    const saved = (await this.repository.save(entity)) as unknown as VendorEntity;

    return VendorMapper.toDomain(saved);
  }

  async findByUserId(userId: number): Promise<Vendor | null> {
    const entity = await this.repository.findOne({ where: { user_id: userId } });
    return entity ? VendorMapper.toDomain(entity) : null;
  }

  async findAll(): Promise<Vendor[]> {
    const entities = await this.repository.find();
    return entities.map(VendorMapper.toDomain);
  }

  async updateStatus(id: number, status: string): Promise<void> {
    await this.repository.update(id, { status });
  }
}