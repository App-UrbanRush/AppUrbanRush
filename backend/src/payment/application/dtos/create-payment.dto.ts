import { IsString, IsEmail, IsObject, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePaymentDto {
  @ApiProperty({ description: 'ID del pedido en MongoDB' })
  @IsString()
  order_id: string;

  @ApiProperty({
    description: 'Objeto de método de pago de Wompi',
    example: { type: 'CARD', token: 'tok_stagtest_...' },
  })
  @IsObject()
  payment_method: Record<string, any>;

  @ApiProperty({ description: 'Email del cliente', example: 'user@example.com' })
  @IsEmail()
  customer_email: string;

  @ApiPropertyOptional({ description: 'ID de transacción ya creada por WidgetCheckout' })
  @IsOptional()
  @IsString()
  transaction_id?: string;

  @ApiPropertyOptional({ description: 'Referencia única (generada en frontend si viene del widget)' })
  @IsOptional()
  @IsString()
  reference?: string;

  @ApiPropertyOptional({ description: 'Estado del pago (APPROVED, DECLINED, etc., si el widget ya lo conoce)' })
  @IsOptional()
  @IsString()
  status?: string;
}
