import { UserRolesEntity } from 'src/user_rol/infrastructure/persistence/entity/user_rol.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';


@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn()
  user_id: number;

  @Column({ unique: true })
  user_email: string;

  @Column()
  user_password: string;

  @OneToMany(() => UserRolesEntity, (ur) => ur.user)
  userroles: UserRolesEntity[];
}