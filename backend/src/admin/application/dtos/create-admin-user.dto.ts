import { IsEmail, IsString, IsNumber, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAdminUserDto {
  @ApiProperty({ example: 'nuevo@urbanrush.com' })
  @IsEmail()
  user_email: string;

  @ApiProperty({ example: 'Password123' })
  @IsString()
  @MinLength(6)
  user_password: string;

  @ApiProperty({ example: 'Juan' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Pérez' })
  @IsString()
  firstLastName: string;

  @ApiProperty({ example: '3001234567' })
  @IsString()
  cellphone: string;

  @ApiProperty({ example: 'Calle 123' })
  @IsString()
  address: string;

  @ApiProperty({ example: 'M' })
  @IsString()
  gender: string;

  @ApiProperty({ example: 2, description: '1=ADMIN, 2=USER, 3=DOMICILIARIO, 4=BUSINESS, 5=SUPERADMIN' })
  @IsNumber()
  rol_id: number;
}
