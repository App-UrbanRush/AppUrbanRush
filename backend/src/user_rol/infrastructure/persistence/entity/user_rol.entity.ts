import { RolEntity } from 'src/roles/infrastructure/persistence/entity/rol.entity';
import { UserEntity } from 'src/user/infrastructure/persistence/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Column } from 'typeorm';

@Entity({ name: 'userroles' })
export class UserRolesEntity {
  @PrimaryGeneratedColumn()
  userroles_id: number;

  @Column()
  user_id: number;

  @Column()
  rol_id: number;

  @ManyToOne(() => UserEntity, (user) => user.userroles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @ManyToOne(() => RolEntity, (rol) => rol.userroles)
  @JoinColumn({ name: 'rol_id' })
  rol: RolEntity;
}