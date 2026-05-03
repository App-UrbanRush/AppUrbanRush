import { VendorEntity } from '../entities/vendor.entity';
import { Vendor } from 'src/vendor/domain/entities/vendor.model';

export class VendorMapper {
  static toDomain(entity: VendorEntity): Vendor {
    return new Vendor(
      entity.vendor_id,
      entity.business_name,
      entity.business_type,
      entity.address,
      entity.phone,
      entity.description,
      entity.status,
      entity.user_id,
    );
  }

  static toEntity(domain: Partial<Vendor>): Partial<VendorEntity> {
    return {
      vendor_id: domain.vendor_id ?? undefined,
      business_name: domain.business_name,
      business_type: domain.business_type,
      address: domain.address,
      phone: domain.phone,
      description: domain.description,
      status: domain.status,
      user_id: domain.user_id,
    };
  }
}