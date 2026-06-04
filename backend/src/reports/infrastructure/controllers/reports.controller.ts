import { Controller, Get, Param, Query, Res, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { JwtAuthGuard } from 'src/auth/infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/infrastructure/guards/roles.guard';
import { Roles, UserRole } from 'src/auth/infrastructure/decorators/roles.decorator';
import { GenerateOrdersReportUseCase } from '../../application/use-cases/generate-orders-report.use-case';
import { GeneratePaymentsReportUseCase } from '../../application/use-cases/generate-payments-report.use-case';
import { GenerateUsersReportUseCase } from '../../application/use-cases/generate-users-report.use-case';
import { GenerateVendorReportUseCase } from '../../application/use-cases/generate-vendor-report.use-case';
import { ReportFiltersDto } from '../../application/dtos/report-filters.dto';

@ApiTags('Reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
@Controller('reports')
export class ReportsController {
  constructor(
    private readonly ordersReport: GenerateOrdersReportUseCase,
    private readonly paymentsReport: GeneratePaymentsReportUseCase,
    private readonly usersReport: GenerateUsersReportUseCase,
    private readonly vendorReport: GenerateVendorReportUseCase,
  ) {}

  // ─── Pedidos ───

  @Get('orders/pdf')
  @ApiOperation({ summary: 'Reporte de pedidos en PDF' })
  async ordersPdf(@Query() filters: ReportFiltersDto, @Res() res: Response) {
    const buffer = await this.ordersReport.pdf(this.parseFilters(filters));
    this.sendPdf(res, buffer, 'reporte-pedidos.pdf');
  }

  @Get('orders/excel')
  @ApiOperation({ summary: 'Reporte de pedidos en Excel' })
  async ordersExcel(@Query() filters: ReportFiltersDto, @Res() res: Response) {
    const buffer = await this.ordersReport.excel(this.parseFilters(filters));
    this.sendExcel(res, buffer, 'reporte-pedidos.xlsx');
  }

  // ─── Pagos ───

  @Get('payments/pdf')
  @ApiOperation({ summary: 'Reporte de pagos en PDF' })
  async paymentsPdf(@Query() filters: ReportFiltersDto, @Res() res: Response) {
    const buffer = await this.paymentsReport.pdf(this.parseFilters(filters));
    this.sendPdf(res, buffer, 'reporte-pagos.pdf');
  }

  @Get('payments/excel')
  @ApiOperation({ summary: 'Reporte de pagos en Excel' })
  async paymentsExcel(@Query() filters: ReportFiltersDto, @Res() res: Response) {
    const buffer = await this.paymentsReport.excel(this.parseFilters(filters));
    this.sendExcel(res, buffer, 'reporte-pagos.xlsx');
  }

  // ─── Usuarios ───

  @Get('users/excel')
  @ApiOperation({ summary: 'Listado de usuarios en Excel' })
  async usersExcel(@Res() res: Response) {
    const buffer = await this.usersReport.excel();
    this.sendExcel(res, buffer, 'reporte-usuarios.xlsx');
  }

  // ─── Vendor ───

  @Get('vendor/:id/pdf')
  @ApiOperation({ summary: 'Reporte completo de un vendor en PDF' })
  async vendorPdf(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    const buffer = await this.vendorReport.pdf(id);
    this.sendPdf(res, buffer, `reporte-vendor-${id}.pdf`);
  }

  // ─── Helpers ───

  private parseFilters(dto: ReportFiltersDto) {
    return {
      from: dto.from,
      to: dto.to,
      status: dto.status,
      vendor_id: dto.vendor_id ? Number(dto.vendor_id) : undefined,
      courier_id: dto.courier_id ? Number(dto.courier_id) : undefined,
    };
  }

  private sendPdf(res: Response, buffer: Buffer, filename: string) {
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': buffer.length,
    });
    res.end(buffer);
  }

  private sendExcel(res: Response, buffer: Buffer, filename: string) {
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': buffer.length,
    });
    res.end(buffer);
  }
}
