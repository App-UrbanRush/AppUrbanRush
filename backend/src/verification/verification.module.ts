import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../user/infrastructure/persistence/entities/user.entity';
import { VerificationController } from './verification.controller';
import { VerificationService } from './verification.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  controllers: [VerificationController],
  providers: [VerificationService],
})
export class VerificationModule {}