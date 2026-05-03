import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { CreateFullUserDto } from './create-full-user.dto';

export class RegisterVendorDto extends CreateFullUserDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Restaurante El Buen Sabor' })
  business_name: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Restaurante', description: 'Tipo: Restaurante, Tienda, Panadería, etc.' })
  business_type: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Calle 10 # 5-20' })
  business_address: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: '3001234567' })
  business_phone: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ example: 'Especialistas en comida típica colombiana' })
  description?: string;
}