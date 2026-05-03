import { UserEntity } from 'src/user/infrastructure/persistence/entities/user.entity';
import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('vendors')
export class VendorEntity {
  @PrimaryGeneratedColumn()
  vendor_id: number;

  @Column({ type: 'varchar', length: 255 })
  business_name: string;

  @Column({ type: 'varchar', length: 100 })
  business_type: string;

  @Column({ type: 'varchar', length: 255 })
  address: string;

  @Column({ type: 'varchar', length: 20 })
  phone: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'varchar', default: 'APPROVED' })
  status: string;

  @OneToOne(() => UserEntity)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column()
  user_id: number;
}