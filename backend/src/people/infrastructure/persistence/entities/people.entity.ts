import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { UserEntity } from '../../../../user/infrastructure/persistence/entities/user.entity';

@Entity({ name: 'people' })
export class PeopleEntity {
  @PrimaryGeneratedColumn()
  people_id: number;

  @Column({ type: 'varchar', length: 255 })
  firstName: string;

  @Column({ type: 'varchar', length: 255 })
  firstLastName: string;

  @Column({ type: 'varchar', length: 255 })
  cellphone: string;

  @Column({ type: 'varchar', length: 255 })
  address: string;

  @Column({ type: 'varchar', length: 255 })
  gender: string;

  @Column({ type: 'varchar', length: 20, unique: true, nullable: true })
  document_number: string;


  @OneToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;
}