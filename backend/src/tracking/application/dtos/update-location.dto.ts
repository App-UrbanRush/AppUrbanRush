import { IsNumber, IsOptional, IsString, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateLocationDto {
  @ApiProperty({ example: 'abc123' })
  @IsString()
  order_id: string;

  @ApiProperty({ example: 4.6489, description: 'Latitud (-90 a 90)' })
  @IsNumber()
  @Min(-90)
  @Max(90)
  lat: number;

  @ApiProperty({ example: -74.0635, description: 'Longitud (-180 a 180)' })
  @IsNumber()
  @Min(-180)
  @Max(180)
  lng: number;

  @ApiPropertyOptional({ example: 15, description: 'Precisión en metros' })
  @IsOptional() @IsNumber()
  accuracy?: number;

  @ApiPropertyOptional({ example: 20, description: 'Velocidad en km/h' })
  @IsOptional() @IsNumber()
  speed?: number;

  @ApiPropertyOptional({ example: 180, description: 'Dirección 0-360 grados' })
  @IsOptional() @IsNumber() @Min(0) @Max(360)
  heading?: number;
}
