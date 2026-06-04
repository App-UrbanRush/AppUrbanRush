import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Request,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Res,
  BadRequestException,
  ParseIntPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { Response } from 'express';
import { JwtAuthGuard } from 'src/auth/infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/infrastructure/guards/roles.guard';
import { Roles, UserRole } from 'src/auth/infrastructure/decorators/roles.decorator';
import { UploadEncryptedFileUseCase } from '../../application/use-cases/upload-encrypted-file.use-case';
import { DecryptFileUseCase } from '../../application/use-cases/decrypt-file.use-case';
import { ListMyFilesUseCase } from '../../application/use-cases/list-my-files.use-case';
import { DeleteFileUseCase } from '../../application/use-cases/delete-file.use-case';
import { FileType } from '../../domain/entities/encrypted-file.model';

@ApiTags('Files')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('files')
export class EncryptedFileController {
  constructor(
    private readonly uploadFile: UploadEncryptedFileUseCase,
    private readonly decryptFile: DecryptFileUseCase,
    private readonly listMyFiles: ListMyFilesUseCase,
    private readonly deleteFile: DeleteFileUseCase,
  ) {}

  @Post('upload')
  @Roles(UserRole.USER, UserRole.DOMICILIARIO, UserRole.BUSINESS, UserRole.ADMIN, UserRole.SUPERADMIN)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
      fileFilter: (_, file, cb) => {
        if (!file.mimetype.match(/^(image\/(jpeg|png|webp)|application\/pdf)$/)) {
          return cb(new BadRequestException('Solo se permiten JPG, PNG, WEBP o PDF'), false);
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
        file: { type: 'string', format: 'binary' },
        file_type: { type: 'string', enum: Object.values(FileType) },
      },
    },
  })
  @ApiOperation({ summary: 'Subir archivo encriptado' })
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body('file_type') fileType: FileType,
    @Request() req,
  ) {
    if (!file) throw new BadRequestException('El archivo es requerido');
    if (!Object.values(FileType).includes(fileType)) {
      throw new BadRequestException('file_type inválido');
    }
    return this.uploadFile.execute(file, fileType, req.user.user_id);
  }

  // IMPORTANTE: esta ruta ANTES que :id para evitar conflictos
  @Get('my-files')
  @Roles(UserRole.USER, UserRole.DOMICILIARIO, UserRole.BUSINESS, UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Listar mis archivos' })
  getMyFiles(@Request() req) {
    return this.listMyFiles.execute(req.user.user_id);
  }

  @Get(':id/download')
  @Roles(UserRole.USER, UserRole.DOMICILIARIO, UserRole.BUSINESS, UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Descargar archivo descifrado (validación de privilegios)' })
  async download(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
    @Res() res: Response,
  ) {
    const result = await this.decryptFile.execute(id, req.user.user_id, req.user.rolIds);

    res.set({
      'Content-Type': result.mimeType,
      'Content-Disposition': `attachment; filename="${result.filename}"`,
      'Content-Length': result.buffer.length,
    });
    res.end(result.buffer);
  }

  @Delete(':id')
  @Roles(UserRole.USER, UserRole.DOMICILIARIO, UserRole.BUSINESS, UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Eliminar archivo (dueño o ADMIN+)' })
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
  ) {
    return this.deleteFile.execute(id, req.user.user_id, req.user.rolIds);
  }
}
