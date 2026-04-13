import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { UserRolService } from '../../application/services/user-roles.service';

@ApiTags('UserRol') 
@Controller('user-rol')
export class UserRolController {
  constructor(private readonly _userRolService: UserRolService) {}

  @Post('assign')
  @ApiOperation({ summary: 'Asigna un rol específico a un usuario' })
  assign(@Body() data: { userId: number; rolId: number }) {
    return this._userRolService.assign(data.userId, data.rolId);
  }
}