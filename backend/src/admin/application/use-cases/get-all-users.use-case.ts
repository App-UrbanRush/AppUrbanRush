import { Injectable, Inject } from '@nestjs/common';
import { IUserRepository } from 'src/user/domain/repositories/user.repository.interface';

@Injectable()
export class GetAllUsersUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async execute() {
    return this.userRepository.findAll();
  }
}