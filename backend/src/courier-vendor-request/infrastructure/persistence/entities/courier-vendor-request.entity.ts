import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('courier_vendor_requests')
export class CourierVendorRequestEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  courier_user_id: number;

  @Column()
  vendor_id: number;

  @Column({ default: 'pending' })
  status: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
