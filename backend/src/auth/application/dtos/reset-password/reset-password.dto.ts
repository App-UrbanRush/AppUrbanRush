import { IsEmail, IsNotEmpty, IsString, Length, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({ description: 'Correo electrónico del usuario' })
  @IsNotEmpty()
  @IsEmail()
  user_email: string;

  @ApiProperty({ description: 'Código de verificación de 6 dígitos enviado por correo' })
  @IsNotEmpty()
  @IsString()
  @Length(6, 6, { message: 'El código debe tener exactamente 6 dígitos' })
  code: string;

  @ApiProperty({ description: 'Nueva contraseña (mínimo 6 caracteres)' })
  @IsNotEmpty()
  @IsString()
  @MinLength(6, { message: 'La nueva contraseña debe tener al menos 6 caracteres' })
  new_password: string;
}