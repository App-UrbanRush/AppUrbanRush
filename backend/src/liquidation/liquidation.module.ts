import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourierEarning, CourierEarningSchema } from './infrastructure/schemas/courier-earning.schema';
import { VendorLiquidation, VendorLiquidationSchema } from './infrastructure/schemas/vendor-liquidation.schema';
import { PayoutTransaction, PayoutTransactionSchema } from './infrastructure/schemas/payout-transaction.schema';
import { BankAccountEntity } from './infrastructure/persistence/entities/bank-account.entity';
import { UserEntity } from 'src/user/infrastructure/persistence/entities/user.entity';
import { PeopleEntity } from 'src/people/infrastructure/persistence/entities/people.entity';
import { VendorEntity } from 'src/vendor/infrastructure/persistence/entities/vendor.entity';
import { CourierEntity } from 'src/courier/infrastructure/persistence/entities/courier.entity';
import { MongoCourierEarningRepository } from './infrastructure/repositories/mongo-courier-earning.repository';
import { MongoVendorLiquidationRepository } from './infrastructure/repositories/mongo-vendor-liquidation.repository';
import { MongoPayoutTransactionRepository } from './infrastructure/repositories/mongo-payout-transaction.repository';
import { TypeormBankAccountRepository } from './infrastructure/persistence/repositories/typeorm-bank-account.repository';
import { ConfigService } from '@nestjs/config';
import { WompiPayoutsService } from './infrastructure/services/wompi-payouts.service';
import { MockPayoutsService } from './infrastructure/services/mock-payouts.service';
import { LiquidationNotificationService } from './infrastructure/services/liquidation-notification.service';
import { RegisterCourierEarningUseCase } from './application/use-cases/register-courier-earning.use-case';
import { RegisterVendorSaleUseCase } from './application/use-cases/register-vendor-sale.use-case';
import { GetCourierBalanceUseCase } from './application/use-cases/get-courier-balance.use-case';
import { GetVendorBalanceUseCase } from './application/use-cases/get-vendor-balance.use-case';
import { ProcessWeeklyLiquidationUseCase } from './application/use-cases/process-weekly-liquidation.use-case';
import { GetAdminSummaryUseCase } from './application/use-cases/get-admin-summary.use-case';
import { RegisterBankAccountUseCase } from './application/use-cases/register-bank-account.use-case';
import { UpdateBankAccountUseCase } from './application/use-cases/update-bank-account.use-case';
import { ListMyBankAccountsUseCase } from './application/use-cases/list-my-bank-accounts.use-case';
import { DeleteBankAccountUseCase } from './application/use-cases/delete-bank-account.use-case';
import { ListMyPayoutsUseCase } from './application/use-cases/list-my-payouts.use-case';
import { ListAllPayoutsUseCase } from './application/use-cases/list-all-payouts.use-case';
import { RetryPayoutUseCase } from './application/use-cases/retry-payout.use-case';
import { LiquidationController } from './infrastructure/controllers/liquidation.controller';
import { BankAccountController } from './infrastructure/controllers/bank-account.controller';
import { OrderModule } from 'src/order/order.module';
import { EmailModule } from 'src/email/email.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CourierEarning.name, schema: CourierEarningSchema },
      { name: VendorLiquidation.name, schema: VendorLiquidationSchema },
      { name: PayoutTransaction.name, schema: PayoutTransactionSchema },
    ]),
    TypeOrmModule.forFeature([BankAccountEntity, UserEntity, PeopleEntity, VendorEntity, CourierEntity]),
    forwardRef(() => OrderModule),
    EmailModule,
  ],
  controllers: [LiquidationController, BankAccountController],
  providers: [
    { provide: 'ICourierEarningRepository', useClass: MongoCourierEarningRepository },
    { provide: 'IVendorLiquidationRepository', useClass: MongoVendorLiquidationRepository },
    { provide: 'IPayoutTransactionRepository', useClass: MongoPayoutTransactionRepository },
    { provide: 'IBankAccountRepository', useClass: TypeormBankAccountRepository },
    WompiPayoutsService,
    MockPayoutsService,
    {
      provide: 'IPayoutGateway',
      inject: [ConfigService, WompiPayoutsService, MockPayoutsService],
      useFactory: (config: ConfigService, wompi: WompiPayoutsService, mock: MockPayoutsService) => {
        const mode = (config.get<string>('PAYOUTS_MODE') ?? 'mock').toLowerCase();
        return mode === 'wompi' ? wompi : mock;
      },
    },
    LiquidationNotificationService,
    RegisterCourierEarningUseCase,
    RegisterVendorSaleUseCase,
    GetCourierBalanceUseCase,
    GetVendorBalanceUseCase,
    ProcessWeeklyLiquidationUseCase,
    GetAdminSummaryUseCase,
    RegisterBankAccountUseCase,
    UpdateBankAccountUseCase,
    ListMyBankAccountsUseCase,
    DeleteBankAccountUseCase,
    ListMyPayoutsUseCase,
    ListAllPayoutsUseCase,
    RetryPayoutUseCase,
  ],
  exports: [RegisterCourierEarningUseCase, RegisterVendorSaleUseCase, GetAdminSummaryUseCase],
})
export class LiquidationModule {}
