import {
  Controller, Get, Post, Put, Delete, Body, Param, Request,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/infrastructure/guards/roles.guard';
import { Roles, UserRole } from 'src/auth/infrastructure/decorators/roles.decorator';
import { CreateCategoryUseCase } from '../../application/use-cases/create-category.use-case';
import { GetCategoriesByVendorUseCase } from '../../application/use-cases/get-categories-by-vendor.use-case';
import { UpdateCategoryUseCase } from '../../application/use-cases/update-category.use-case';
import { DeleteCategoryUseCase } from '../../application/use-cases/delete-category.use-case';
import { GetVendorProfileUseCase } from 'src/vendor/application/use-cases/get-vendor-profile.use-case';

@ApiTags('Categories')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('categories')
export class CategoryController {
  constructor(
    private readonly createCategory: CreateCategoryUseCase,
    private readonly getCategoriesByVendor: GetCategoriesByVendorUseCase,
    private readonly updateCategory: UpdateCategoryUseCase,
    private readonly deleteCategory: DeleteCategoryUseCase,
    private readonly getVendorProfile: GetVendorProfileUseCase,
  ) {}

  @Get('vendor')
  @ApiOperation({ summary: 'Obtener categorías del vendor autenticado' })
  async getMyCategories(@Request() req) {
    const vendor = await this.getVendorProfile.execute(req.user.user_id);
    return this.getCategoriesByVendor.execute(vendor.vendor_id!);
  }

  @Get('vendor/:vendorId')
  @ApiOperation({ summary: 'Obtener categorías de un vendedor' })
  async getByVendor(@Param('vendorId') vendorId: string) {
    return this.getCategoriesByVendor.execute(Number(vendorId));
  }

  @Post()
  @Roles(UserRole.BUSINESS)
  @ApiOperation({ summary: 'Crear categoría (BUSINESS)' })
  async create(
    @Request() req,
    @Body() body: { name: string; image_url?: string },
  ) {
    // Obtener el vendor_id correcto del perfil del vendor autenticado
    const vendor = await this.getVendorProfile.execute(req.user.user_id);
    return this.createCategory.execute(vendor.vendor_id!, body.name, body.image_url);
  }

  @Put(':id')
  @Roles(UserRole.BUSINESS)
  @ApiOperation({ summary: 'Actualizar categoría (BUSINESS)' })
  async update(
    @Param('id') id: string,
    @Body() body: { name?: string; image_url?: string },
  ) {
    return this.updateCategory.execute(id, body);
  }

  @Delete(':id')
  @Roles(UserRole.BUSINESS)
  @ApiOperation({ summary: 'Eliminar categoría (BUSINESS)' })
  async remove(@Param('id') id: string, @Request() req) {
    const vendor = await this.getVendorProfile.execute(req.user.user_id);
    return this.deleteCategory.execute(id, vendor.vendor_id!);
  }
}
