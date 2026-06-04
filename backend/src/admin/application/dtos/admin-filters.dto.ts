import { IsOptional, IsString, IsNumberString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class AdminUserFiltersDto {
  @ApiPropertyOptional({ description: 'Filtrar por rol (1=ADMIN, 2=USER, 3=DOMICILIARIO, 4=BUSINESS, 5=SUPERADMIN)' })
  @IsOptional()
  @IsNumberString()
  role?: string;

  @ApiPropertyOptional({ description: 'Buscar por email o nombre' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Estado de verificación (pending, verified, rejected)' })
  @IsOptional()
  @IsString()
  verification_status?: string;
}
