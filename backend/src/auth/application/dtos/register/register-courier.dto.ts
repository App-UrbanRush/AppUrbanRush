import { ApiProperty } from '@nestjs/swagger';
import { CreateFullUserDto } from './create-full-user.dto';
import { IsNotEmpty, IsString } from 'class-validator';

export class RegisterCourierDto extends CreateFullUserDto {

    @IsString()
    @IsNotEmpty()
    @ApiProperty({ example: 'Moto' })
    vehicle_type: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({ example: 'XYZ-123' })
    vehicle_plate: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({ example: 'SOAT-456' })
    soat_number: string;

}