import { IsString, IsNumber, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateVendorProfileDto {
  @ApiPropertyOptional({ description: 'Dirección del negocio' })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({ description: 'Horario de atención' })
  @IsString()
  @IsOptional()
  business_hours?: string;

  @ApiPropertyOptional({ description: 'Teléfono del negocio' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ description: 'Descripción del negocio' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Latitud de la ubicación del negocio' })
  @IsNumber()
  @IsOptional()
  latitude?: number;

  @ApiPropertyOptional({ description: 'Longitud de la ubicación del negocio' })
  @IsNumber()
  @IsOptional()
  longitude?: number;
}
