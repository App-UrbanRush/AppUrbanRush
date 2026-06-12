import { CourierLocationModel } from '../entities/courier-location.model';

export interface IGPSRepository {
  saveLocation(location: CourierLocationModel, ttlSeconds: number): Promise<void>;
  getLocation(courierId: number): Promise<CourierLocationModel | null>;
  getLocationsByCourierIds(courierIds: number[]): Promise<CourierLocationModel[]>;
  deleteLocation(courierId: number): Promise<void>;
}
