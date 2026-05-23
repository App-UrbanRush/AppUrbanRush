import { ApiProperty } from '@nestjs/swagger';
import { CreateFullUserDto } from './create-full-user.dto';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

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

    @IsOptional()
    @IsString()
    @ApiProperty({ example: '2020-01-15', required: false })
    expedition_date?: string;

    @IsOptional()
    @IsString()
    @ApiProperty({ example: 'Bogotá, Cundinamarca', required: false })
    expedition_place?: string;

}