import { Courier } from 'src/courier/domain/entities/courier.model';
import { CourierEntity } from '../entities/courier.entity';

export class CourierMapper {
  static toDomain(entity: CourierEntity): Courier {
    return new Courier(
      entity.couriers_id,
      entity.vehicle_type,
      entity.vehicle_plate,
      entity.soat_number,
      entity.status,
      entity.user_id,
    );
  }

  static toPersistence(domain: Courier): CourierEntity {
    const entity = new CourierEntity();
    entity.couriers_id = domain.couriers_id!; 
    entity.vehicle_type = domain.vehicle_type;
    entity.vehicle_plate = domain.vehicle_plate;
    entity.soat_number = domain.soat_number;
    entity.status = domain.status;
    entity.user_id = domain.user_id;
    return entity;
  }
}