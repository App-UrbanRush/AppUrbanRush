import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CourierVendorRequestEntity } from '../entities/courier-vendor-request.entity';
import { ICourierVendorRequestRepository } from '../../../domain/repositories/courier-vendor-request.repository';
import { CourierVendorRequest } from '../../../domain/entities/courier-vendor-request.model';

@Injectable()
export class TypeOrmCourierVendorRequestRepository implements ICourierVendorRequestRepository {
  constructor(
    @InjectRepository(CourierVendorRequestEntity)
    private readonly repository: Repository<CourierVendorRequestEntity>,
  ) {}

  async create(courierUserId: number, vendorId: number): Promise<CourierVendorRequest> {
    const entity = this.repository.create({
      courier_user_id: courierUserId,
      vendor_id: vendorId,
      status: 'pending',
    });
    const saved = await this.repository.save(entity);
    return {
      id: saved.id,
      courier_user_id: saved.courier_user_id,
      vendor_id: saved.vendor_id,
      status: saved.status,
      created_at: saved.created_at,
      updated_at: saved.updated_at,
    };
  }

  async findById(id: number): Promise<CourierVendorRequest | null> {
    const entity = await this.repository.findOne({ where: { id } });
    if (!entity) return null;
    return {
      id: entity.id,
      courier_user_id: entity.courier_user_id,
      vendor_id: entity.vendor_id,
      status: entity.status,
      created_at: entity.created_at,
      updated_at: entity.updated_at,
    };
  }

  async findByCourierAndVendor(courierUserId: number, vendorId: number): Promise<CourierVendorRequest | null> {
    const entity = await this.repository.findOne({
      where: { courier_user_id: courierUserId, vendor_id: vendorId },
    });
    if (!entity) return null;
    return {
      id: entity.id,
      courier_user_id: entity.courier_user_id,
      vendor_id: entity.vendor_id,
      status: entity.status,
      created_at: entity.created_at,
      updated_at: entity.updated_at,
    };
  }

  async findByCourierUserId(courierUserId: number): Promise<CourierVendorRequest[]> {
    const entities = await this.repository.find({
      where: { courier_user_id: courierUserId },
      order: { created_at: 'DESC' },
    });
    return entities.map((e) => ({
      id: e.id,
      courier_user_id: e.courier_user_id,
      vendor_id: e.vendor_id,
      status: e.status,
      created_at: e.created_at,
      updated_at: e.updated_at,
    }));
  }

  async findByVendorId(vendorId: number): Promise<CourierVendorRequest[]> {
    const entities = await this.repository.find({
      where: { vendor_id: vendorId },
      order: { created_at: 'DESC' },
    });
    return entities.map((e) => ({
      id: e.id,
      courier_user_id: e.courier_user_id,
      vendor_id: e.vendor_id,
      status: e.status,
      created_at: e.created_at,
      updated_at: e.updated_at,
    }));
  }

  async updateStatus(id: number, status: string): Promise<void> {
    await this.repository.update(id, { status });
  }
}
