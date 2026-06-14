import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EncryptedFileEntity } from './infrastructure/persistence/entities/encrypted-file.entity';
import { TypeormEncryptedFileRepository } from './infrastructure/persistence/repositories/typeorm-encrypted-file.repository';
import { EncryptionService } from './infrastructure/services/encryption.service';
import { CloudinaryService } from './infrastructure/services/cloudinary.service';
import { UploadEncryptedFileUseCase } from './application/use-cases/upload-encrypted-file.use-case';
import { DecryptFileUseCase } from './application/use-cases/decrypt-file.use-case';
import { ListMyFilesUseCase } from './application/use-cases/list-my-files.use-case';
import { DeleteFileUseCase } from './application/use-cases/delete-file.use-case';
import { EncryptedFileController } from './infrastructure/controllers/encrypted-file.controller';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [TypeOrmModule.forFeature([EncryptedFileEntity]), NotificationsModule],
  controllers: [EncryptedFileController],
  providers: [
    TypeormEncryptedFileRepository,
    { provide: 'IEncryptedFileRepository', useClass: TypeormEncryptedFileRepository },
    EncryptionService,
    CloudinaryService,
    UploadEncryptedFileUseCase,
    DecryptFileUseCase,
    ListMyFilesUseCase,
    DeleteFileUseCase,
  ],
  exports: ['IEncryptedFileRepository', EncryptionService, CloudinaryService],
})
export class EncryptedFileModule {}
