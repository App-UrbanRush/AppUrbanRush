import { IsString, IsEmail, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

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
}
