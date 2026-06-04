import {
  Controller, Post, Param, Request, UseGuards, UseInterceptors,
  UploadedFile, BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/infrastructure/guards/roles.guard';
import { Roles, UserRole } from 'src/auth/infrastructure/decorators/roles.decorator';
import { UploadProductImageUseCase } from '../../application/use-cases/upload-product-image.use-case';
import { UploadVendorImageUseCase } from '../../application/use-cases/upload-vendor-image.use-case';

const imageInterceptor = FileInterceptor('image', {
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_, file, cb) => {
    if (!file.mimetype.match(/^image\/(jpeg|png|webp)$/)) {
      return cb(new BadRequestException('Solo se permiten imágenes JPG, PNG o WEBP'), false);
    }
    cb(null, true);
  },
});

const imageApiBody = {
  schema: {
    type: 'object' as const,
    properties: { image: { type: 'string', format: 'binary' } },
  },
};

@ApiTags('Images')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class StorageController {
  constructor(
    private readonly uploadProductImage: UploadProductImageUseCase,
    private readonly uploadVendorImage: UploadVendorImageUseCase,
  ) {}

  @Post('products/:id/image')
  @Roles(UserRole.BUSINESS)
  @UseInterceptors(imageInterceptor)
  @ApiConsumes('multipart/form-data')
  @ApiBody(imageApiBody)
  @ApiOperation({ summary: 'Subir imagen de producto (BUSINESS)' })
  async productImage(
    @Param('id') id: string,
    @UploadedFile() image: Express.Multer.File,
  ) {
    if (!image) throw new BadRequestException('La imagen es requerida');
    return this.uploadProductImage.execute(id, image);
  }

  @Post('vendor/logo')
  @Roles(UserRole.BUSINESS)
  @UseInterceptors(imageInterceptor)
  @ApiConsumes('multipart/form-data')
  @ApiBody(imageApiBody)
  @ApiOperation({ summary: 'Subir logo del local (BUSINESS)' })
  async vendorLogo(
    @UploadedFile() image: Express.Multer.File,
    @Request() req,
  ) {
    if (!image) throw new BadRequestException('La imagen es requerida');
    return this.uploadVendorImage.executeLogo(req.user.user_id, image);
  }

  @Post('vendor/storefront-image')
  @Roles(UserRole.BUSINESS)
  @UseInterceptors(imageInterceptor)
  @ApiConsumes('multipart/form-data')
  @ApiBody(imageApiBody)
  @ApiOperation({ summary: 'Subir foto de fachada del local (BUSINESS)' })
  async vendorStorefront(
    @UploadedFile() image: Express.Multer.File,
    @Request() req,
  ) {
    if (!image) throw new BadRequestException('La imagen es requerida');
    return this.uploadVendorImage.executeStorefront(req.user.user_id, image);
  }
}
