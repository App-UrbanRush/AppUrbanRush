import { CourierEarningModel } from '../entities/courier-earning.model';

export interface ICourierEarningRepository {
  create(earning: CourierEarningModel): Promise<CourierEarningModel>;
  findByCourierId(courierId: number): Promise<CourierEarningModel[]>;
  findByOrderId(orderId: string): Promise<CourierEarningModel | null>;
  findAllPending(): Promise<CourierEarningModel[]>;
  markAsPaid(ids: string[]): Promise<number>;
}
