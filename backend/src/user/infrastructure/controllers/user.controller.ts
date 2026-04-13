import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { UserService } from '../../application/services/user.service';
import { ApiTags } from '@nestjs/swagger';
import { CreateUserDto } from 'src/user/application/dtos/create-user.dto';
import { UpdateUserDto } from 'src/user/application/dtos/update-user.dto';

@ApiTags('User')
@Controller('user')
export class UserController {
    constructor(private readonly _userService: UserService) { }

    @Post()
    crear(@Body() dto: CreateUserDto) { return this._userService.create(dto); }

    @Get()
    obtener() {
        return this._userService.obtenerUsuarios();
    }

    @Get(':id')
    obtenerPorId(@Param('id') id: number) {
        return this._userService.obtenerUsuarioPorId(id);
    }

    @Put(':id')
    actualizar(@Param('id') id: number, @Body() dto: UpdateUserDto) {
        return this._userService.actualizarUsuario(id, dto);
    }

    @Delete(':id')
    eliminar(@Param('id') id: number) {
        return this._userService.eliminarUsuario(id);
    }

}