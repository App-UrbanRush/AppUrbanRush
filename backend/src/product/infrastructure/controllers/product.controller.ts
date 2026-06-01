import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/infrastructure/guards/jwt-auth.guard';
import { CreateProductUseCase } from '../../application/use-cases/create-product.use-case';
import { GetProductsByVendorUseCase } from '../../application/use-cases/get-products-by-vendor.use-case';
import { GetAllProductsUseCase } from '../../application/use-cases/get-all-products.use-case';
import { UpdateProductUseCase } from '../../application/use-cases/update-product.use-case';
import { DeleteProductUseCase } from '../../application/use-cases/delete-product.use-case';
import { CreateProductDto } from '../../application/dtos/create-product.dto';
import { UpdateProductDto } from '../../application/dtos/update-product.dto';

@ApiTags('Products')
@Controller('products')
export class ProductController {
  constructor(
    private readonly createProduct: CreateProductUseCase,
    private readonly getByVendor: GetProductsByVendorUseCase,
    private readonly getAllProducts: GetAllProductsUseCase,
    private readonly updateProduct: UpdateProductUseCase,
    private readonly deleteProduct: DeleteProductUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todos los productos disponibles' })
  findAll() {
    return this.getAllProducts.execute();
  }

  @Get('vendor/:vendorId')
  @ApiOperation({ summary: 'Catálogo de un vendedor' })
  getByVendorId(@Param('vendorId') vendorId: string) {
    return this.getByVendor.execute(Number(vendorId));
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear producto' })
  create(@Body() dto: CreateProductDto) {
    return this.createProduct.execute(dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar producto' })
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.updateProduct.execute(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar producto' })
  remove(@Param('id') id: string) {
    return this.deleteProduct.execute(id);
  }
}