import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { SendCourierVendorRequestUseCase } from '../../application/use-cases/send-courier-vendor-request.use-case';
import { GetMyCourierVendorRequestsUseCase } from '../../application/use-cases/get-my-courier-vendor-requests.use-case';
import { GetVendorCourierRequestsUseCase } from '../../application/use-cases/get-vendor-courier-requests.use-case';
import { UpdateCourierVendorRequestStatusUseCase } from '../../application/use-cases/update-courier-vendor-request-status.use-case';
import { GetCourierDetailsUseCase } from '../../application/use-cases/get-courier-details.use-case';
import { DeleteCourierVendorRequestUseCase } from '../../application/use-cases/delete-courier-vendor-request.use-case';
import { Inject } from '@nestjs/common';
import { IVendorRepository } from '../../../vendor/domain/repositories/vendor.repository';

@ApiTags('Courier Vendor Requests')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('courier-vendor-requests')
export class CourierVendorRequestController {
  constructor(
    private readonly sendRequest: SendCourierVendorRequestUseCase,
    private readonly getMyRequests: GetMyCourierVendorRequestsUseCase,
    private readonly getVendorRequests: GetVendorCourierRequestsUseCase,
    private readonly updateStatus: UpdateCourierVendorRequestStatusUseCase,
    private readonly getCourierDetails: GetCourierDetailsUseCase,
    private readonly deleteRequestUseCase: DeleteCourierVendorRequestUseCase,
    @Inject('IVendorRepository')
    private readonly vendorRepo: IVendorRepository,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Enviar solicitud de registro a un negocio' })
  async send(@Request() req, @Body() body: { vendor_id: number }) {
    return this.sendRequest.execute(req.user.user_id, body.vendor_id);
  }

  @Get('my')
  @ApiOperation({ summary: 'Ver mis solicitudes enviadas' })
  async getMy(@Request() req) {
    return this.getMyRequests.execute(req.user.user_id);
  }

  @Get('vendor')
  @ApiOperation({ summary: 'Ver solicitudes recibidas del negocio' })
  async getVendor(@Request() req) {
    const vendor = await this.vendorRepo.findByUserId(req.user.user_id);
    if (!vendor || !vendor.vendor_id) {
      return [];
    }
    return this.getVendorRequests.execute(vendor.vendor_id);
  }

  @Get('details/:userId')
  @ApiOperation({ summary: 'Obtener datos completos del domiciliario' })
  async getCourierDetailsByUserId(@Param('userId') userId: string) {
    return this.getCourierDetails.execute(parseInt(userId));
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Actualizar estado de solicitud' })
  async updateRequestStatus(
    @Param('id') id: string,
    @Body() body: { status: string },
  ) {
    return this.updateStatus.execute(parseInt(id), body.status);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar solicitud' })
  async delete(@Param('id') id: string) {
    return this.deleteRequestUseCase.execute(parseInt(id));
  }
}
