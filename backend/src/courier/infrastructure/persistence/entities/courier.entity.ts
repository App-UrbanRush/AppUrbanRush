import { UserEntity } from "src/user/infrastructure/persistence/entities/user.entity";
import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('couriers')
export class CourierEntity {
  @PrimaryGeneratedColumn()
  couriers_id: number;

  @Column({ type: 'varchar' })
  vehicle_type: string;

  @Column({ type: 'varchar', nullable: true })
  vehicle_plate: string | null;

  @Column({ type: 'varchar', nullable: true })
  soat_number: string | null;

  @Column({ type: 'varchar', default: 'VERIFIED' })
  status: string;

  @OneToOne(() => UserEntity)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column()
  user_id: number;
}