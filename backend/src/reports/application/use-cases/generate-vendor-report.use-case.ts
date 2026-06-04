import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IReportsRepository } from '../../domain/repositories/reports.repository.interface';
import { PdfGeneratorService } from '../../infrastructure/services/pdf-generator.service';

@Injectable()
export class GenerateVendorReportUseCase {
  constructor(
    @Inject('IReportsRepository')
    private readonly reportsRepo: IReportsRepository,
    private readonly pdfService: PdfGeneratorService,
  ) {}

  async pdf(vendorId: number): Promise<Buffer> {
    const vendor = await this.reportsRepo.getVendorReport(vendorId);
    if (!vendor) throw new NotFoundException('Vendor no encontrado');

    const headers = ['Campo', 'Valor'];
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

    return this.pdfService.generateTable(
      `Reporte Vendor: ${vendor.business_name} — UrbanRush`,
      headers,
      rows,
    );
  }
}
