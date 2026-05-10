import type { IAuthRepository } from "../../domain/interfaces/IAuthRepository";
import type { AuthResponse, RegisterDeliveryRequest } from "../../domain/types/auth.types";

export class RegisterDeliveryUseCase {

  private authRepository: IAuthRepository;

  constructor(authRepository: IAuthRepository) {
    this.authRepository = authRepository;
  }

  async execute(data: RegisterDeliveryRequest): Promise<AuthResponse> {
    return this.authRepository.registerDelivery(data);
  }
}