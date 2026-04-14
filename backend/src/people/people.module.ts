import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PeopleService } from './application/services/people.service';
import { TypeOrmPeopleRepository } from './infrastructure/persistence/repositories/typeorm-people.repository';
import { PeopleEntity } from './infrastructure/persistence/entities/people.entity';
import { PeopleController } from './infrastructure/controllers/people.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PeopleEntity])],
  controllers: [PeopleController],
  providers: [
    PeopleService,
    {
      provide: 'IPeopleRepository',
      useClass: TypeOrmPeopleRepository,
    },
  ],
})
export class PeopleModule {}