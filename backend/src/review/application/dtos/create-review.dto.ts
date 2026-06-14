import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsString, IsOptional, Min, Max, MinLength } from 'class-validator';

export class CreateReviewDto {
  @ApiProperty({ description: 'ID del negocio' })
  @IsInt()
  vendor_id: number;

  @ApiProperty({ description: 'ID de la orden entregada' })
  @IsString()
  order_id: string;

  @ApiProperty({ description: 'Calificación del 1 al 5', minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiPropertyOptional({ description: 'Comentario de la reseña' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  comment?: string;
}
