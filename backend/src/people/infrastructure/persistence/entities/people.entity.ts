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

  @Column({ type: 'varchar', length: 500, nullable: true })
  avatar_url: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  document_number: string;

  @Column({ type: 'date', nullable: true })
  expedition_date: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  expedition_place: string;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitude: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitude: number | null;

  @Column({ nullable: true })
  user_id: number;

  @OneToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;
}