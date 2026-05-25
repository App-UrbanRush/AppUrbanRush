import { PeopleEntity } from 'src/people/infrastructure/persistence/entities/people.entity';
import { UserRolesEntity } from 'src/user_rol/infrastructure/persistence/entity/user_rol.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, OneToOne } from 'typeorm';

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

  @Column({ name: 'reset_password_code', type: 'varchar', length: 6, nullable: true })
  resetPasswordCode: string | null;

  @Column({ name: 'reset_password_expires_at', type: 'timestamp', nullable: true })
  resetPasswordExpiresAt: Date | null;


  @Column({
    type: 'enum',
    enum: VerificationStatus,
    default: VerificationStatus.VERIFIED,
    nullable: true,
  })
  verification_status: VerificationStatus;


  @OneToMany(() => UserRolesEntity, (ur) => ur.user)
  userroles: UserRolesEntity[];
  @OneToOne(() => PeopleEntity, (person) => person.user)
  person: PeopleEntity;
}