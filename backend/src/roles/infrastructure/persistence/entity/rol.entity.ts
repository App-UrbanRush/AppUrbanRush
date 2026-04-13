import { UserRolesEntity } from 'src/user_rol/infrastructure/persistence/entity/user_rol.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';


@Entity({ name: 'rol' })
export class RolEntity {
  @PrimaryGeneratedColumn()
  rol_id: number;

  @Column({ unique: true })
  rol_name: string;

  @OneToMany(() => UserRolesEntity, (userroles) => userroles.rol)
  userroles: UserRolesEntity[];
}