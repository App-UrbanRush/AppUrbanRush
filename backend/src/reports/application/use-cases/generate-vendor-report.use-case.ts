import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IReportsRepository } from '../../domain/repositories/reports.repository.interface';
import { PdfGeneratorService } from '../../infrastructure/services/pdf-generator.service';
import { ExcelGeneratorService } from '../../infrastructure/services/excel-generator.service';

@Injectable()
export class GenerateVendorReportUseCase {
  constructor(
    @Inject('IReportsRepository')
    private readonly reportsRepo: IReportsRepository,
    private readonly pdfService: PdfGeneratorService,
    private readonly excelService: ExcelGeneratorService,
  ) {}

  private async buildRows(vendorId: number) {
    const vendor = await this.reportsRepo.getVendorReport(vendorId);
    if (!vendor) throw new NotFoundException('Vendor no encontrado');

    const rows: (string | number)[][] = [
      ['ID', vendor.vendor_id],
      ['Negocio', vendor.business_name],
      ['Tipo', vendor.business_type],
      ['Dirección', vendor.address],
      ['Teléfono', vendor.phone],
      ['Estado', vendor.status],
      ['Email', vendor.user_email],
      ['Total pedidos', vendor.total_orders],
      ['Ingresos totales', `$${vendor.total_revenue.toLocaleString('es-CO')}`],
    ];
    return { vendor, rows };
  }

  async pdf(vendorId: number): Promise<Buffer> {
    const { vendor, rows } = await this.buildRows(vendorId);
    return this.pdfService.generateTable(
      `Reporte Vendor: ${vendor.business_name} — UrbanRush`,
      ['Campo', 'Valor'],
      rows,
    );
  }

  async excel(vendorId: number): Promise<Buffer> {
    const { rows } = await this.buildRows(vendorId);
    return this.excelService.generateTable('Vendor', ['Campo', 'Valor'], rows);
  }
}
