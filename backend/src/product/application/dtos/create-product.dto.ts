import { IsString, IsNumber, IsOptional, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty() @IsNumber() vendor_id: number;
  @ApiProperty() @IsString() name: string;
  @ApiProperty() @IsString() description: string;
  @ApiProperty() @IsNumber() @Min(0) price: number;
  @ApiProperty() @IsString() category: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() image_url?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() @Min(0) stock?: number;
}