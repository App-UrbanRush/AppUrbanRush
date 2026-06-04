import { IsOptional, IsString, IsNumberString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ReportFiltersDto {
  @ApiPropertyOptional({ description: 'Fecha inicio (YYYY-MM-DD)', example: '2026-01-01' })
  @IsOptional()
  @IsString()
  from?: string;

  @ApiPropertyOptional({ description: 'Fecha fin (YYYY-MM-DD)', example: '2026-12-31' })
  @IsOptional()
  @IsString()
  to?: string;

  @ApiPropertyOptional({ description: 'Estado', example: 'APPROVED' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ description: 'ID del vendor' })
  @IsOptional()
  @IsNumberString()
  vendor_id?: string;

  @ApiPropertyOptional({ description: 'ID del domiciliario' })
  @IsOptional()
  @IsNumberString()
  courier_id?: string;
}
