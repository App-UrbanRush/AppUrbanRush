import { Injectable, Inject } from '@nestjs/common';
import { IAdminUserRepository } from '../../domain/repositories/admin-user.repository.interface';
import { UserFilters } from '../../domain/interfaces/admin.interfaces';

@Injectable()
export class GetFilteredUsersUseCase {
  constructor(
    @Inject('IAdminUserRepository')
    private readonly adminUserRepo: IAdminUserRepository,
  ) {}

  async execute(filters: UserFilters) {
    return this.adminUserRepo.findFiltered(filters);
  }

  async executeCommonUsers() {
    return this.adminUserRepo.findCommonUsers();
  }

  async executeAdmins() {
    return this.adminUserRepo.findAdmins();
  }
}
