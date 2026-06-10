import { UserEntity } from 'src/user/infrastructure/persistence/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('bank_accounts')
export class BankAccountEntity {
  @PrimaryGeneratedColumn()
  bank_account_id: number;

  @Column()
  user_id: number;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column({ type: 'varchar', length: 255 })
  holder_name: string;

  @Column({ type: 'varchar', length: 4 })
  holder_document_type: string;

  @Column({ type: 'varchar', length: 30 })
  holder_document_number: string;

  @Column({ type: 'varchar', length: 10 })
  bank_code: string;

  @Column({ type: 'varchar', length: 100 })
  bank_name: string;

  @Column({ type: 'varchar', length: 10 })
  account_type: string;

  @Column({ type: 'varchar', length: 60 })
  account_number: string;

  @Column({ type: 'boolean', default: false })
  is_default: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;
}
