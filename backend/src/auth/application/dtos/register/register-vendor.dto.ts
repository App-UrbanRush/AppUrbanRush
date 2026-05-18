import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, IsOptional, MinLength } from 'class-validator';

export class RegisterVendorDto {
  @IsEmail({}, { message: 'El correo electrónico no es válido' })
  @IsNotEmpty({ message: 'El correo electrónico es obligatorio' })
  @ApiProperty({ description: 'Correo electrónico del usuario' })
  user_email: string;

  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  @ApiProperty({ description: 'Contraseña del usuario' })
  user_password: string;

  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @IsString()
  @ApiProperty({ description: 'Nombre del propietario' })
  firstName: string;

  @IsNotEmpty({ message: 'El apellido es obligatorio' })
  @IsString()
  @ApiProperty({ description: 'Apellido del propietario' })
  firstLastName: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'Número de documento' })
  document_number?: string;

  @IsNotEmpty({ message: 'El celular es obligatorio' })
  @IsString()
  @ApiProperty({ description: 'Celular del propietario' })
  cellphone: string;

  @IsNotEmpty({ message: 'El género es obligatorio' })
  @IsString()
  @ApiProperty({ description: 'Género del propietario' })
  gender: string;

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

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ description: 'NIT del negocio' })
  nit?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ description: 'URL de documento legal' })
  document_url?: string;
}
