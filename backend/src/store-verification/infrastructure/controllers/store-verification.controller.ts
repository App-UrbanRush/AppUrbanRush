import {
  Controller, Post, Get, Request, UseGuards, UseInterceptors,
  UploadedFile, BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/infrastructure/guards/roles.guard';
import { Roles, UserRole } from 'src/auth/infrastructure/decorators/roles.decorator';
import { VerifyStorefrontUseCase } from '../../application/use-cases/verify-storefront.use-case';
import { GetVerificationHistoryUseCase } from '../../application/use-cases/get-verification-history.use-case';

@ApiTags('Store Verification')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('vendor')
export class StoreVerificationController {
  constructor(
    private readonly verifyStorefront: VerifyStorefrontUseCase,
    private readonly getHistory: GetVerificationHistoryUseCase,
  ) {}

  @Post('verify-storefront')
  @Roles(UserRole.BUSINESS)
  @UseInterceptors(
    FileInterceptor('image', {
      limits: { fileSize: 10 * 1024 * 1024 },
      fileFilter: (_, file, cb) => {
        if (!file.mimetype.match(/^image\/(jpeg|png|webp)$/)) {
          return cb(new BadRequestException('Solo se permiten imágenes JPG, PNG o WEBP'), false);
        }
        cb(null, true);
      },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: { type: 'string', format: 'binary', description: 'Foto del letrero o fachada del local' },
      },
    },
  })
  @ApiOperation({ summary: 'Verificar letrero del local con IA (BUSINESS)' })
  async verify(@UploadedFile() image: Express.Multer.File, @Request() req) {
    if (!image) throw new BadRequestException('La imagen es requerida');
    return this.verifyStorefront.execute(req.user.user_id, image, req.user.user_email);
  }

  @Get('verification-history')
  @Roles(UserRole.BUSINESS)
  @ApiOperation({ summary: 'Historial de verificaciones del vendor (BUSINESS)' })
  async history(@Request() req) {
    return this.getHistory.execute(req.user.user_id);
  }
}
