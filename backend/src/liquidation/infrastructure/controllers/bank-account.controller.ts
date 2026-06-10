import {
  Controller, Get, Post, Put, Delete, Body, Param, Request, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/infrastructure/guards/roles.guard';
import { Roles, UserRole } from 'src/auth/infrastructure/decorators/roles.decorator';
import { CreateBankAccountDto } from '../../application/dtos/create-bank-account.dto';
import { UpdateBankAccountDto } from '../../application/dtos/update-bank-account.dto';
import { RegisterBankAccountUseCase } from '../../application/use-cases/register-bank-account.use-case';
import { UpdateBankAccountUseCase } from '../../application/use-cases/update-bank-account.use-case';
import { ListMyBankAccountsUseCase } from '../../application/use-cases/list-my-bank-accounts.use-case';
import { DeleteBankAccountUseCase } from '../../application/use-cases/delete-bank-account.use-case';

@ApiTags('Bank Accounts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('bank-accounts')
export class BankAccountController {
  constructor(
    private readonly registerAccount: RegisterBankAccountUseCase,
    private readonly updateAccount: UpdateBankAccountUseCase,
    private readonly listMyAccounts: ListMyBankAccountsUseCase,
    private readonly deleteAccount: DeleteBankAccountUseCase,
  ) {}

  @Post()
  @Roles(UserRole.DOMICILIARIO, UserRole.BUSINESS)
  @ApiOperation({ summary: 'Registrar cuenta bancaria para recibir pagos' })
  create(@Body() dto: CreateBankAccountDto, @Request() req) {
    return this.registerAccount.execute(req.user.user_id, dto);
  }

  @Get()
  @Roles(UserRole.DOMICILIARIO, UserRole.BUSINESS)
  @ApiOperation({ summary: 'Listar mis cuentas bancarias (con número enmascarado)' })
  listMine(@Request() req) {
    return this.listMyAccounts.execute(req.user.user_id);
  }

  @Put(':id')
  @Roles(UserRole.DOMICILIARIO, UserRole.BUSINESS)
  @ApiOperation({ summary: 'Actualizar cuenta bancaria propia' })
  update(@Param('id') id: string, @Body() dto: UpdateBankAccountDto, @Request() req) {
    return this.updateAccount.execute(req.user.user_id, Number(id), dto);
  }

  @Delete(':id')
  @Roles(UserRole.DOMICILIARIO, UserRole.BUSINESS)
  @ApiOperation({ summary: 'Eliminar cuenta bancaria propia' })
  remove(@Param('id') id: string, @Request() req) {
    return this.deleteAccount.execute(req.user.user_id, Number(id));
  }
}
