import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StoreVerification, StoreVerificationSchema } from './infrastructure/schemas/store-verification.schema';
import { MongoStoreVerificationRepository } from './infrastructure/repositories/mongo-store-verification.repository';
import { StorefrontAIService } from './infrastructure/services/storefront-ai.service';
import { VerifyStorefrontUseCase } from './application/use-cases/verify-storefront.use-case';
import { GetVerificationHistoryUseCase } from './application/use-cases/get-verification-history.use-case';
import { StoreVerificationController } from './infrastructure/controllers/store-verification.controller';
import { VendorModule } from 'src/vendor/vendor.module';
import { EmailModule } from 'src/email/email.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: StoreVerification.name, schema: StoreVerificationSchema }]),
    VendorModule,
    EmailModule,
  ],
  controllers: [StoreVerificationController],
  providers: [
    MongoStoreVerificationRepository,
    { provide: 'IStoreVerificationRepository', useClass: MongoStoreVerificationRepository },
    StorefrontAIService,
    VerifyStorefrontUseCase,
    GetVerificationHistoryUseCase,
  ],
})
export class StoreVerificationModule {}
