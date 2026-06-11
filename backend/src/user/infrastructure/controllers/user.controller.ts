import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { UserService } from '../../application/services/user.service';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CreateUserDto } from 'src/user/application/dtos/create-user.dto';
import { UpdateUserDto } from 'src/user/application/dtos/update-user.dto';
import { JwtAuthGuard } from 'src/auth/infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/infrastructure/guards/roles.guard';
import { Roles, UserRole } from 'src/auth/infrastructure/decorators/roles.decorator';

@ApiTags('User')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('user')
export class UserController {
    constructor(private readonly _userService: UserService) { }

    @Post()
    @Roles(UserRole.SUPERADMIN)
    crear(@Body() dto: CreateUserDto) { return this._userService.create(dto); }

    @Get()
    @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
    obtener() {
        return this._userService.obtenerUsuarios();
    }

    @Get(':id')
    @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
    obtenerPorId(@Param('id') id: number) {
        return this._userService.obtenerUsuarioPorId(id);
    }

    @Put(':id')
    @Roles(UserRole.SUPERADMIN)
    actualizar(@Param('id') id: number, @Body() dto: UpdateUserDto) {
        return this._userService.actualizarUsuario(id, dto);
    }

    @Delete(':id')
    @Roles(UserRole.SUPERADMIN)
    eliminar(@Param('id') id: number) {
        return this._userService.eliminarUsuario(id);
    }

}