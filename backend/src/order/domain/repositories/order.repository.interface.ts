import { OrderModel } from '../entities/order.model';

export interface IOrderRepository {
  create(order: OrderModel): Promise<OrderModel>;
  findById(id: string): Promise<OrderModel | null>;
  findByUser(userId: number): Promise<OrderModel[]>;
  findByVendor(vendorId: number): Promise<OrderModel[]>;
  findAvailableForCourier(): Promise<OrderModel[]>;
  updateStatus(id: string, status: string, courierId?: number): Promise<OrderModel | null>;
}