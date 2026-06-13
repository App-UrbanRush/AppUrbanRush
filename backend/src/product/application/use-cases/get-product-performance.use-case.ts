import { Injectable, Inject } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Product, ProductDocument } from '../../infrastructure/schemas/product.schema';
import { ProductPerformanceDTO } from '../dtos/product-performance.dto';

@Injectable()
export class GetProductPerformanceUseCase {
  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
  ) {}

  async execute(vendorId: number, limit: number = 5, days: number = 7): Promise<ProductPerformanceDTO[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Obtener orders del vendor en los últimos X días
    const orders = await this.productModel.db
      .collection('orders')
      .aggregate([
        {
          $match: {
            vendor_id: vendorId,
            status: { $in: ['DELIVERED'] },
            createdAt: { $gte: startDate },
          },
        },
        {
          $unwind: '$items',
        },
        {
          $group: {
            _id: '$items.product_id',
            total_sold: { $sum: '$items.quantity' },
          },
        },
        {
          $sort: { total_sold: -1 },
        },
        {
          $limit: limit,
        },
        {
          $lookup: {
            from: 'products',
            let: { product_id_str: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: [{ $toString: '$_id' }, '$$product_id_str'] },
                },
              },
            ],
            as: 'product',
          },
        },
        {
          $unwind: '$product',
        },
        {
          $project: {
            product_id: '$_id',
            name: '$product.name',
            image_url: '$product.image_url',
            category: '$product.category',
            total_sold: 1,
          },
        },
      ])
      .toArray();

    return orders.map((item: any) => ({
      product_id: item.product_id.toString(),
      name: item.name,
      image_url: item.image_url,
      category: item.category,
      total_sold: item.total_sold,
    }));
  }
}