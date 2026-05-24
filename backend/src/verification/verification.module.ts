import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../user/infrastructure/persistence/entities/user.entity';
import { VerificationController } from './verification.controller';
import { VerificationService } from './verification.service';
import { PeopleEntity } from 'src/people/infrastructure/persistence/entities/people.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, PeopleEntity])],
  controllers: [VerificationController],
  providers: [VerificationService],
})
export class VerificationModule {}