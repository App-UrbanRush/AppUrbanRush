import { IsString, IsNumber, IsOptional, IsBoolean, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProductDto {
  @ApiProperty({ required: false }) @IsOptional() @IsString() name?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() description?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() @Min(0) price?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsString() category?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() image_url?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() is_available?: boolean;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() @Min(0) stock?: number;
}