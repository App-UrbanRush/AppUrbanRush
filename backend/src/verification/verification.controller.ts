import {
  Controller, Post, Body, UseGuards,
  Request, UploadedFiles, UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { VerificationService, VerificationResult } from './verification.service';

@Controller('verification')
export class VerificationController {
  constructor(private readonly verificationService: VerificationService) {}

@Post('verify-document')
// Sin @UseGuards — el usuario no está registrado aún
@UseInterceptors(FilesInterceptor('images', 2, {
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_, file, cb) => {
    if (!file.mimetype.match(/^image\/(jpeg|png|webp)$/)) {
      return cb(new BadRequestException('Solo se permiten imágenes JPG, PNG o WEBP'), false);
    }
    cb(null, true);
  },
}))
async verifyDocument(
  @UploadedFiles() images: Express.Multer.File[],
  @Body() body: {
    cedula: string;
    firstName: string;
    firstLastName: string;
    birthDate: string;
  },
) {
  if (!images || images.length === 0) {
    throw new BadRequestException('Debes subir al menos una foto de tu cédula');
  }

  // Sin userId — no guarda nada en BD todavía
  return this.verificationService.verifyDocument(images, body, null);
}
@Post('confirm-verification')
@UseGuards(AuthGuard('jwt'))
async confirmVerification(@Request() req, @Body() body: { documentNumber: string }) {
  await this.verificationService.updateVerificationStatus(req.user.user_id, body.documentNumber);
  return { message: 'Verificación confirmada' };
}
}