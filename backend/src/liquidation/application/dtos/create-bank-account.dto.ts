import { IsString, IsIn, IsOptional, IsBoolean, Length } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBankAccountDto {
  @ApiProperty({ example: 'Juan Pérez' })
  @IsString() @Length(3, 255)
  holder_name: string;

  @ApiProperty({ example: 'CC', enum: ['CC', 'CE', 'NIT', 'PP'] })
  @IsIn(['CC', 'CE', 'NIT', 'PP'])
  holder_document_type: 'CC' | 'CE' | 'NIT' | 'PP';

  @ApiProperty({ example: '1020304050' })
  @IsString() @Length(5, 30)
  holder_document_number: string;

  @ApiProperty({ example: '1007', description: 'Código del banco según Wompi' })
  @IsString() @Length(1, 10)
  bank_code: string;

  @ApiProperty({ example: 'Bancolombia' })
  @IsString() @Length(2, 100)
  bank_name: string;

  @ApiProperty({ example: 'SAVINGS', enum: ['SAVINGS', 'CHECKING'] })
  @IsIn(['SAVINGS', 'CHECKING'])
  account_type: 'SAVINGS' | 'CHECKING';

  @ApiProperty({ example: '12345678901' })
  @IsString() @Length(4, 60)
  account_number: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional() @IsBoolean()
  is_default?: boolean;
}
