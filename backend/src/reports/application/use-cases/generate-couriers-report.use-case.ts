import { Injectable, Inject } from '@nestjs/common';
import { IReportsRepository } from '../../domain/repositories/reports.repository.interface';
import { ExcelGeneratorService } from '../../infrastructure/services/excel-generator.service';

@Injectable()
export class GenerateCouriersReportUseCase {
  constructor(
    @Inject('IReportsRepository')
    private readonly reportsRepo: IReportsRepository,
    private readonly excelService: ExcelGeneratorService,
  ) {}

  async excel(): Promise<Buffer> {
    const couriers = await this.reportsRepo.getCouriers();
    const headers = ['ID', 'Nombre', 'Placa', 'Vehículo', 'Pedidos completados', 'Estado'];
    const rows = couriers.map((c) => [
      c.couriers_id,
      c.name,
      c.vehicle_plate,
      c.vehicle_type,
      c.completed_orders,
      c.status,
    ]);
    return this.excelService.generateTable('Domiciliarios', headers, rows);
  }
}
