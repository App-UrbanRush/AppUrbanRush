import type { IAuthRepository } from "../../domain/interfaces/IAuthRepository";
import type { RegisterVendorRequest, VendorRegisterResponse } from "../../domain/types/vendor.types";

export class RegisterVendorUseCase {
  constructor(private readonly authRepository: IAuthRepository) {}

  async execute(data: RegisterVendorRequest): Promise<VendorRegisterResponse> {
    return this.authRepository.registerVendor(data);
  }
}