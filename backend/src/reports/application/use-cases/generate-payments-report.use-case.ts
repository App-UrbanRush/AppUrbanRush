import { Injectable, Inject } from '@nestjs/common';
import { IReportsRepository } from '../../domain/repositories/reports.repository.interface';
import { PdfGeneratorService } from '../../infrastructure/services/pdf-generator.service';
import { ExcelGeneratorService } from '../../infrastructure/services/excel-generator.service';
import { ReportFilters } from '../../domain/interfaces/report-data.interface';

@Injectable()
export class GeneratePaymentsReportUseCase {
  constructor(
    @Inject('IReportsRepository')
    private readonly reportsRepo: IReportsRepository,
    private readonly pdfService: PdfGeneratorService,
    private readonly excelService: ExcelGeneratorService,
  ) {}

  async pdf(filters: ReportFilters): Promise<Buffer> {
    const payments = await this.reportsRepo.getPayments(filters);
    const headers = ['ID', 'Orden', 'Usuario', 'Vendor', 'Monto', 'Moneda', 'Estado', 'Método', 'Email', 'Fecha'];
    const rows = payments.map((p) => [
      p.payment_id,
      p.order_id,
      p.user_id,
      p.vendor_id,
      `$${(p.amount / 100).toLocaleString('es-CO')}`,
      p.currency,
      p.status,
      p.payment_method,
      p.customer_email,
      p.created_at ? new Date(p.created_at).toLocaleDateString('es-CO') : '',
    ]);
    return this.pdfService.generateTable('Reporte de Pagos — UrbanRush', headers, rows);
  }

  async excel(filters: ReportFilters): Promise<Buffer> {
    const payments = await this.reportsRepo.getPayments(filters);
    const headers = ['ID', 'Orden', 'Usuario', 'Vendor', 'Monto (centavos)', 'Moneda', 'Estado', 'Método', 'Referencia', 'Email', 'Fecha'];
    const rows = payments.map((p) => [
      p.payment_id,
      p.order_id,
      p.user_id,
      p.vendor_id,
      p.amount,
      p.currency,
      p.status,
      p.payment_method,
      p.reference,
      p.customer_email,
      p.created_at ? new Date(p.created_at).toLocaleDateString('es-CO') : '',
    ]);
    return this.excelService.generateTable('Pagos', headers, rows);
  }
}
