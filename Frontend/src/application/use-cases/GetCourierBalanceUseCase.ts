import type { IEarningsRepository } from "../../domain/interfaces/IEarningsRepository";
import type { CourierBalance } from "../../domain/types/earnings.types";

export class GetCourierBalanceUseCase {
  constructor(private readonly repo: IEarningsRepository) {}

  async execute(courierId: number): Promise<CourierBalance> {
    return this.repo.getCourierBalance(courierId);
  }
}
