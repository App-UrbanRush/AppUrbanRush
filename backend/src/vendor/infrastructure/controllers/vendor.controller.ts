import { Controller, Get, Put, Body, UseGuards, Request, Query, Res, Param } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { GetVendorProfileUseCase } from '../../application/use-cases/get-vendor-profile.use-case';
import { UpdateVendorProfileUseCase } from '../../application/use-cases/update-vendor-profile.use-case';
import { GetVendorCouriersUseCase } from '../../application/use-cases/get-vendor-couriers.use-case';
import { GetVendorReportDataUseCase } from '../../application/use-cases/get-vendor-report-data.use-case';
import { GenerateVendorOrdersPdfUseCase } from '../../application/use-cases/generate-vendor-orders-pdf.use-case';
import { GenerateVendorOrdersExcelUseCase } from '../../application/use-cases/generate-vendor-orders-excel.use-case';
import { GetVendorPendingOrdersUseCase } from '../../application/use-cases/get-vendor-pending-orders.use-case';
import { GetAllVendorsUseCase } from '../../application/use-cases/get-all-vendors.use-case';
import { GetVendorPhotosByIdUseCase } from '../../../vendor-photos/application/use-cases/get-vendor-photos-by-id.use-case';
import { UpdateVendorProfileDto } from '../../application/dts/update-vendor-profile.dto';

@ApiTags('Vendor')
@ApiBearerAuth()
@Controller('vendor')
export class VendorController {
  constructor(
    private readonly getVendorProfileUseCase: GetVendorProfileUseCase,
    private readonly updateVendorProfileUseCase: UpdateVendorProfileUseCase,
    private readonly getVendorCouriersUseCase: GetVendorCouriersUseCase,
    private readonly getVendorReportDataUseCase: GetVendorReportDataUseCase,
    private readonly generateVendorOrdersPdfUseCase: GenerateVendorOrdersPdfUseCase,
    private readonly generateVendorOrdersExcelUseCase: GenerateVendorOrdersExcelUseCase,
    private readonly getVendorPendingOrdersUseCase: GetVendorPendingOrdersUseCase,
    private readonly getAllVendorsUseCase: GetAllVendorsUseCase,
    private readonly getVendorPhotosByIdUseCase: GetVendorPhotosByIdUseCase,
  ) {}

  @Get('all')
  @ApiOperation({ summary: 'Obtener todos los negocios registrados' })
  @ApiResponse({ status: 200, description: 'Lista de negocios.' })
  async getAllVendors() {
    return this.getAllVendorsUseCase.execute();
  }

  @Get(':vendorId/photos')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Obtener fotos de un negocio por ID' })
  @ApiResponse({ status: 200, description: 'Lista de fotos del negocio.' })
  async getVendorPhotos(@Param('vendorId') vendorId: number) {
    return this.getVendorPhotosByIdUseCase.execute(vendorId);
  }

  @Get('profile')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Obtener perfil del vendedor' })
  @ApiResponse({ status: 200, description: 'Perfil del vendedor.' })
  @ApiResponse({ status: 404, description: 'Vendedor no encontrado.' })
  async getProfile(@Request() req) {
    return this.getVendorProfileUseCase.execute(req.user.user_id);
  }

  @Put('profile')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Actualizar perfil del vendedor' })
  @ApiResponse({ status: 200, description: 'Perfil actualizado correctamente.' })
  @ApiResponse({ status: 404, description: 'Vendedor no encontrado.' })
  async updateProfile(@Request() req, @Body() dto: UpdateVendorProfileDto) {
    return this.updateVendorProfileUseCase.execute(req.user.user_id, dto);
  }

  @Get('couriers')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Domiciliarios asociados al restaurante' })
  @ApiResponse({ status: 200, description: 'Lista de domiciliarios.' })
  async getCouriers(@Request() req) {
    const vendor = await this.getVendorProfileUseCase.execute(req.user.user_id);
    return this.getVendorCouriersUseCase.execute(vendor.vendor_id!);
  }

  @Get('reports/data')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Datos del reporte del vendedor' })
  async getReportData(@Request() req, @Query('from') from?: string, @Query('to') to?: string) {
    const vendor = await this.getVendorProfileUseCase.execute(req.user.user_id);
    return this.getVendorReportDataUseCase.execute(vendor.vendor_id!, from, to);
  }

  @Get('reports/orders/pdf')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Reporte de pedidos en PDF' })
  async ordersPdf(@Request() req, @Query('from') from?: string, @Query('to') to?: string, @Res() res?: Response) {
    const vendor = await this.getVendorProfileUseCase.execute(req.user.user_id);
    const buffer = await this.generateVendorOrdersPdfUseCase.execute(vendor.vendor_id!, from, to);
    res?.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="reporte-pedidos-${vendor.vendor_id}.pdf"`,
      'Content-Length': buffer.length,
    });
    res?.end(buffer);
  }

  @Get('reports/orders/excel')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Reporte de pedidos en Excel' })
  async ordersExcel(@Request() req, @Query('from') from?: string, @Query('to') to?: string, @Res() res?: Response) {
    const vendor = await this.getVendorProfileUseCase.execute(req.user.user_id);
    const buffer = await this.generateVendorOrdersExcelUseCase.execute(vendor.vendor_id!, from, to);
    res?.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="reporte-pedidos-${vendor.vendor_id}.xlsx"`,
      'Content-Length': buffer.length,
    });
    res?.end(buffer);
  }

  @Get('orders/pending')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Pedidos pendientes del vendedor (notificaciones)' })
  async getPendingOrders(@Request() req) {
    const vendor = await this.getVendorProfileUseCase.execute(req.user.user_id);
    return this.getVendorPendingOrdersUseCase.execute(vendor.vendor_id!);
  }
}
