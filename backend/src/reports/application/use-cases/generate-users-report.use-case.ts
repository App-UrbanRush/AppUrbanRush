import { Injectable, Inject } from '@nestjs/common';
import { IReportsRepository } from '../../domain/repositories/reports.repository.interface';
import { ExcelGeneratorService } from '../../infrastructure/services/excel-generator.service';

@Injectable()
export class GenerateUsersReportUseCase {
  constructor(
    @Inject('IReportsRepository')
    private readonly reportsRepo: IReportsRepository,
    private readonly excelService: ExcelGeneratorService,
  ) {}

  async excel(): Promise<Buffer> {
    const users = await this.reportsRepo.getUsers();
    const headers = ['ID', 'Email', 'Nombre', 'Apellido', 'Celular', 'Verificación', 'Roles'];
    const rows = users.map((u) => [
      u.user_id,
      u.user_email,
      u.firstName,
      u.firstLastName,
      u.cellphone,
      u.verification_status,
      u.roles,
    ]);
    return this.excelService.generateTable('Usuarios', headers, rows);
  }
}
