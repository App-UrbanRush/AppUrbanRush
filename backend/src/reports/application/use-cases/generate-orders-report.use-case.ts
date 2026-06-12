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

  private readonly headers = ['ID', 'Cliente', 'Negocio', 'Courier', 'Estado', 'Dirección', 'Total', 'Items', 'Fecha'];

  async pdf(filters: ReportFilters): Promise<Buffer> {
    const orders = await this.reportsRepo.getOrders(filters);
    const rows = orders.map((o) => [
      o.order_id,
      o.customer_name,
      o.vendor_name,
      o.courier_id ?? 'N/A',
      o.status,
      o.delivery_address,
      `$${o.total.toLocaleString('es-CO')}`,
      o.items_count,
      o.created_at ? new Date(o.created_at).toLocaleDateString('es-CO') : '',
    ]);
    return this.pdfService.generateTable('Reporte de Pedidos — UrbanRush', this.headers, rows);
  }

  async excel(filters: ReportFilters): Promise<Buffer> {
    const orders = await this.reportsRepo.getOrders(filters);
    const rows = orders.map((o) => [
      o.order_id,
      o.customer_name,
      o.vendor_name,
      o.courier_id ?? 'N/A',
      o.status,
      o.delivery_address,
      o.total,
      o.items_count,
      o.created_at ? new Date(o.created_at).toLocaleDateString('es-CO') : '',
    ]);
    return this.excelService.generateTable('Pedidos', this.headers, rows);
  }
}
