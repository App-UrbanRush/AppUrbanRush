import { UserEntity } from 'src/user/infrastructure/persistence/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('encrypted_files')
export class EncryptedFileEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  original_filename: string;

  @Column({ type: 'varchar', length: 100 })
  mime_type: string;

  @Column({ type: 'varchar', length: 500 })
  cloudinary_public_id: string;

  @Column({ type: 'varchar', length: 500 })
  cloudinary_url: string;

  @Column({ type: 'varchar', length: 64 })
  encryption_iv: string;

  @Column({ type: 'varchar', length: 64 })
  encryption_auth_tag: string;

  @Column({ type: 'text' })
  encrypted_file_key: string;

  @Column({ type: 'varchar', length: 50 })
  file_type: string;

  @Column()
  owner_id: number;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'owner_id' })
  owner: UserEntity;

  @CreateDateColumn()
  created_at: Date;
}
