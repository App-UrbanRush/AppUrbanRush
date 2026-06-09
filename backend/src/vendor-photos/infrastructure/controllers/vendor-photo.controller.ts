import {
  Controller, Post, Get, Delete, Param, Request, UseGuards, UseInterceptors,
  UploadedFile, BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/infrastructure/guards/roles.guard';
import { Roles, UserRole } from 'src/auth/infrastructure/decorators/roles.decorator';
import { UploadVendorPhotoUseCase } from '../../application/use-cases/upload-vendor-photo.use-case';
import { GetVendorPhotosUseCase } from '../../application/use-cases/get-vendor-photos.use-case';
import { DeleteVendorPhotoUseCase } from '../../application/use-cases/delete-vendor-photo.use-case';

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

@ApiTags('Vendor Photos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('vendor/photos')
export class VendorPhotoController {
  constructor(
    private readonly uploadPhoto: UploadVendorPhotoUseCase,
    private readonly getPhotos: GetVendorPhotosUseCase,
    private readonly deletePhoto: DeleteVendorPhotoUseCase,
  ) {}

  @Post()
  @Roles(UserRole.BUSINESS)
  @UseInterceptors(imageInterceptor)
  @ApiConsumes('multipart/form-data')
  @ApiBody(imageApiBody)
  @ApiOperation({ summary: 'Subir foto del local (BUSINESS)' })
  async upload(@UploadedFile() image: Express.Multer.File, @Request() req) {
    if (!image) throw new BadRequestException('La imagen es requerida');
    return this.uploadPhoto.execute(req.user.user_id, image);
  }

  @Get()
  @Roles(UserRole.BUSINESS)
  @ApiOperation({ summary: 'Obtener todas las fotos del local (BUSINESS)' })
  async getAll(@Request() req) {
    return this.getPhotos.execute(req.user.user_id);
  }

  @Delete(':id')
  @Roles(UserRole.BUSINESS)
  @ApiOperation({ summary: 'Eliminar foto del local (BUSINESS)' })
  async remove(@Param('id') id: string, @Request() req) {
    return this.deletePhoto.execute(req.user.user_id, id);
  }
}
