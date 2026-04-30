import { UserRolesEntity } from 'src/user_rol/infrastructure/persistence/entity/user_rol.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

export enum VerificationStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
}

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn()
  user_id: number;

  @Column({ type: 'varchar', length: 255, unique: true })
  user_email: string;

  @Column({ type: 'varchar', length: 255 })
  user_password: string;

  @Column({ type: 'boolean', default: true })
  status: boolean;

  // ── NUEVAS COLUMNAS ──────────────────────────────────────────
  @Column({
    type: 'enum',
    enum: VerificationStatus,
    default: VerificationStatus.PENDING,
    nullable: true,
  })
  verification_status: VerificationStatus;

  @Column({ type: 'varchar', length: 20, nullable: true })
  document_number: string;
  // ─────────────────────────────────────────────────────────────

  @OneToMany(() => UserRolesEntity, (ur) => ur.user)
  userroles: UserRolesEntity[];
}