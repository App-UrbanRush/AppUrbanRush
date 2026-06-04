import { Injectable, Inject } from '@nestjs/common';
import { IReportsRepository } from '../../domain/repositories/reports.repository.interface';
import { PdfGeneratorService } from '../../infrastructure/services/pdf-generator.service';
import { ExcelGeneratorService } from '../../infrastructure/services/excel-generator.service';
import { ReportFilters } from '../../domain/interfaces/report-data.interface';

@Injectable()
export class GenerateOrdersReportUseCase {
  constructor(
    @Inject('IReportsRepository')
    private readonly reportsRepo: IReportsRepository,
    private readonly pdfService: PdfGeneratorService,
    private readonly excelService: ExcelGeneratorService,
  ) {}

  async pdf(filters: ReportFilters): Promise<Buffer> {
    const orders = await this.reportsRepo.getOrders(filters);
    const headers = ['ID', 'Usuario', 'Vendor', 'Courier', 'Estado', 'Dirección', 'Total', 'Items', 'Fecha'];
    const rows = orders.map((o) => [
      o.order_id,
      o.user_id,
      o.vendor_id,
      o.courier_id ?? 'N/A',
      o.status,
      o.delivery_address,
      `$${o.total.toLocaleString('es-CO')}`,
      o.items_count,
      o.created_at ? new Date(o.created_at).toLocaleDateString('es-CO') : '',
    ]);
    return this.pdfService.generateTable('Reporte de Pedidos — UrbanRush', headers, rows);
  }

  async excel(filters: ReportFilters): Promise<Buffer> {
    const orders = await this.reportsRepo.getOrders(filters);
    const headers = ['ID', 'Usuario', 'Vendor', 'Courier', 'Estado', 'Dirección', 'Total', 'Items', 'Fecha'];
    const rows = orders.map((o) => [
      o.order_id,
      o.user_id,
      o.vendor_id,
      o.courier_id ?? 'N/A',
      o.status,
      o.delivery_address,
      o.total,
      o.items_count,
      o.created_at ? new Date(o.created_at).toLocaleDateString('es-CO') : '',
    ]);
    return this.excelService.generateTable('Pedidos', headers, rows);
  }
}
