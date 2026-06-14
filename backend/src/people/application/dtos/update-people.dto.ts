import { IsOptional, IsString, IsNumber } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdatePeopleDto {
  @ApiPropertyOptional({ description: 'Nombre de la persona' })
  @IsOptional()
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  firstName?: string;

  @ApiPropertyOptional({ description: 'Apellido de la persona' })
  @IsOptional()
  @IsString({ message: 'El apellido debe ser una cadena de texto' })
  firstLastName?: string;

  @ApiPropertyOptional({ description: 'Número de celular de la persona' })
  @IsOptional()
  @IsString({ message: 'El celular debe ser una cadena de texto' })
  cellphone?: string;

  @ApiPropertyOptional({ description: 'Dirección de residencia de la persona' })
  @IsOptional()
  @IsString({ message: 'La dirección debe ser una cadena de texto' })
  address?: string;

  @ApiPropertyOptional({ description: 'Género de la persona' })
  @IsOptional()
  @IsString({ message: 'El género debe ser una cadena de texto' })
  gender?: string;

  @ApiPropertyOptional({ description: 'URL del avatar (enviar null para eliminar)' })
  @IsOptional()
  avatarUrl?: string | null;

  @ApiPropertyOptional({ description: 'Latitud de la ubicación' })
  @IsOptional()
  @IsNumber({}, { message: 'La latitud debe ser un número' })
  latitude?: number;

  @ApiPropertyOptional({ description: 'Longitud de la ubicación' })
  @IsOptional()
  @IsNumber({}, { message: 'La longitud debe ser un número' })
  longitude?: number;
}