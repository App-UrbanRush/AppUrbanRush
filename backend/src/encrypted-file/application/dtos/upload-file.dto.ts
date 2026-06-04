import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { FileType } from '../../domain/entities/encrypted-file.model';

export class UploadFileDto {
  @ApiProperty({
    enum: FileType,
    description: 'Tipo de archivo',
    example: FileType.IDENTITY_DOC,
  })
  @IsEnum(FileType)
  file_type: FileType;
}
