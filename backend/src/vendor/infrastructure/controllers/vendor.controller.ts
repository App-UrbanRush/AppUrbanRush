import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GetVendorProfileUseCase } from '../../application/use-cases/get-vendor-profile.use-case';

@ApiTags('Vendor')
@Controller('vendor')
export class VendorController {
  constructor(
    private readonly getVendorProfileUseCase: GetVendorProfileUseCase,
  ) {}

  @Get('profile')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Obtener perfil del vendedor' })
  @ApiResponse({ status: 200, description: 'Perfil del vendedor.' })
  @ApiResponse({ status: 404, description: 'Vendedor no encontrado.' })
  async getProfile(@Request() req) {
    return this.getVendorProfileUseCase.execute(req.user.user_id);
  }
}