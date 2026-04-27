import { UserRolesEntity } from 'src/user_rol/infrastructure/persistence/entity/user_rol.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';


@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn()
  user_id: number;

  @Column({ type: 'varchar', length: 255, unique: true })
  user_email: string;

  @Column({ type: 'varchar', length: 255 })
  user_password: string;

  // Agrega esto para que coincida con tu lógica de negocio
  @Column({ type: 'boolean', default: true })
  status: boolean;

  @OneToMany(() => UserRolesEntity, (ur) => ur.user)
  userroles: UserRolesEntity[];
}