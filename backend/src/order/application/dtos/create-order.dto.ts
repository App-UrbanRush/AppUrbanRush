import { IsNumber, IsString, IsArray, ValidateNested, Min, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class OrderItemDto {
  @ApiProperty() @IsString() product_id: string;
  @ApiProperty() @IsNumber() @Min(1) quantity: number;
}

export class CreateOrderDto {
  @ApiProperty() @IsNumber() user_id: number;
  @ApiProperty() @IsNumber() vendor_id: number;
  @ApiProperty() @IsString() delivery_address: string;
  @ApiProperty({ type: [OrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() customer_lat?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() customer_lng?: number;
}