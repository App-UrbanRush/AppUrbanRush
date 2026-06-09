import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from '../../../order/infrastructure/schemas/order.schema';
import { PdfGeneratorService } from '../../../reports/infrastructure/services/pdf-generator.service';

@Injectable()
export class GenerateVendorOrdersPdfUseCase {
  constructor(
    @InjectModel(Order.name)
    private readonly orderModel: Model<OrderDocument>,
    private readonly pdfService: PdfGeneratorService,
  ) {}

  async execute(vendorId: number, from?: string, to?: string): Promise<Buffer> {
    const query: any = { vendor_id: vendorId };
    if (from || to) {
      query.createdAt = {};
      if (from) query.createdAt.$gte = new Date(from);
      if (to) query.createdAt.$lte = new Date(to + 'T23:59:59.999Z');
    }

    const orders = await this.orderModel.find(query).sort({ createdAt: -1 }).exec();

    const headers = ['ID', 'Estado', 'Direccion', 'Total', 'Items', 'Fecha'];
    const rows = orders.map((o) => [
      o._id.toString().slice(-8),
      o.status,
      o.delivery_address,
      `$${o.total.toLocaleString('es-CO')}`,
      o.items?.length ?? 0,
      new Date((o as any).createdAt).toLocaleDateString('es-CO'),
    ]);

    return this.pdfService.generateTable(
      `Reporte de Pedidos — Vendor #${vendorId}`,
      headers,
      rows,
    );
  }
}
