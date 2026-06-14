import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from '../../../order/infrastructure/schemas/order.schema';

export interface VendorReportData {
  total_orders: number;
  total_revenue: number;
  delivered_orders: number;
  cancelled_orders: number;
  pending_orders: number;
  orders_by_status: Record<string, number>;
  orders_by_day: { date: string; count: number; revenue: number }[];
  top_products: { product_name: string; total_quantity: number; total_revenue: number }[];
}

@Injectable()
export class GetVendorReportDataUseCase {
  constructor(
    @InjectModel(Order.name)
    private readonly orderModel: Model<OrderDocument>,
  ) {}

  async execute(vendorId: number, from?: string, to?: string): Promise<VendorReportData> {
    const query: any = { vendor_id: vendorId };

    if (from || to) {
      query.createdAt = {};
      if (from) query.createdAt.$gte = new Date(from);
      if (to) query.createdAt.$lte = new Date(to + 'T23:59:59.999Z');
    }

    const orders = await this.orderModel.find(query).exec();

    const total_orders = orders.length;
    const total_revenue = orders.reduce((sum, o) => sum + o.subtotal, 0);
    const delivered_orders = orders.filter(o => o.status === 'DELIVERED').length;
    const cancelled_orders = orders.filter(o => o.status === 'CANCELLED').length;
    const pending_orders = orders.filter(o => o.status === 'PENDING').length;

    const orders_by_status: Record<string, number> = {};
    for (const order of orders) {
      orders_by_status[order.status] = (orders_by_status[order.status] || 0) + 1;
    }

    const dayMap = new Map<string, { count: number; revenue: number }>();
    for (const order of orders) {
      const date = new Date((order as any).createdAt).toISOString().split('T')[0];
      const existing = dayMap.get(date) || { count: 0, revenue: 0 };
      existing.count += 1;
      existing.revenue += order.subtotal;
      dayMap.set(date, existing);
    }
    const orders_by_day = Array.from(dayMap.entries())
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const productMap = new Map<string, { total_quantity: number; total_revenue: number }>();
    for (const order of orders) {
      for (const item of order.items || []) {
        const existing = productMap.get(item.product_name) || { total_quantity: 0, total_revenue: 0 };
        existing.total_quantity += item.quantity;
        existing.total_revenue += item.unit_price * item.quantity;
        productMap.set(item.product_name, existing);
      }
    }
    const top_products = Array.from(productMap.entries())
      .map(([product_name, data]) => ({ product_name, ...data }))
      .sort((a, b) => b.total_revenue - a.total_revenue)
      .slice(0, 10);

    return {
      total_orders,
      total_revenue,
      delivered_orders,
      cancelled_orders,
      pending_orders,
      orders_by_status,
      orders_by_day,
      top_products,
    };
  }
}
