import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from 'src/user/infrastructure/persistence/entities/user.entity';
import { IAdminUserRepository, AdminUserView } from '../../domain/repositories/admin-user.repository.interface';
import { UserFilters } from '../../domain/interfaces/admin.interfaces';

@Injectable()
export class TypeormAdminUserRepository implements IAdminUserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
  ) {}

  async findFiltered(filters: UserFilters): Promise<AdminUserView[]> {
    let qb = this.userRepo.createQueryBuilder('u')
      .leftJoinAndSelect('u.userroles', 'ur')
      .leftJoinAndSelect('u.person', 'p');

    if (filters.role) {
      qb = qb.andWhere('ur.rol_id = :role', { role: filters.role });
    }

    if (filters.verification_status) {
      qb = qb.andWhere('u.verification_status = :vs', { vs: filters.verification_status });
    }

    if (filters.search) {
      qb = qb.andWhere(
        '(u.user_email ILIKE :search OR p.firstName ILIKE :search OR p.firstLastName ILIKE :search)',
        { search: `%${filters.search}%` },
      );
    }

    const users = await qb.orderBy('u.user_id', 'DESC').getMany();
    return users.map(this.toView);
  }

  async findCommonUsers(): Promise<AdminUserView[]> {
    const all = await this.findFiltered({});
    return all.filter((u) => {
      return u.roles.some((r) => [2, 3, 4].includes(r)) &&
             !u.roles.some((r) => [1, 5].includes(r));
    });
  }

  async findAdmins(): Promise<AdminUserView[]> {
    return this.findFiltered({ role: 1 });
  }

  async findById(id: number): Promise<AdminUserView | null> {
    const user = await this.userRepo.findOne({
      where: { user_id: id },
      relations: ['userroles', 'person'],
    });
    return user ? this.toView(user) : null;
  }

  private toView(u: UserEntity): AdminUserView {
    return {
      user_id: u.user_id,
      user_email: u.user_email,
      status: u.status,
      verification_status: u.verification_status ?? 'pending',
      roles: (u.userroles ?? []).map((r) => r.rol_id),
      person: u.person ? {
        firstName: u.person.firstName,
        firstLastName: u.person.firstLastName,
        cellphone: u.person.cellphone,
      } : null,
    };
  }
}
