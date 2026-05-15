import { Body, Controller, Get, Param, Put, Req, UseGuards } from "@nestjs/common";
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { AuthGuard } from "@nestjs/passport";
import { UpdatePeopleDto } from "src/people/application/dtos/update-people.dto";
import { PeopleService } from "src/people/application/services/people.service";


@ApiTags('people')
@ApiBearerAuth()
@Controller('people')
@UseGuards(AuthGuard('jwt'))
export class PeopleController {
  constructor(private readonly _peopleService: PeopleService) {}

  @Get()
  obtenerPersonas() {
    return this._peopleService.obtenerPersonas();
  }

  @Get('my-profile')
  obtenerMiPersona(@Req() request: any) {
    const user = request.user;
    return this._peopleService.obtenerPersonaPorUserId(user.user_id);
  }

  @Get(':id')
  obtenerPersonaPorId(@Param('id') id: number) {
    return this._peopleService.obtenerPersonaPorId(id);
  }

  @Put(':id')
  update(@Req() request: any, @Param('id') id: number, @Body() dto: UpdatePeopleDto) {
      const user = request.user;
      return this._peopleService.actualizarPersona(id, dto, user);
    }
}
