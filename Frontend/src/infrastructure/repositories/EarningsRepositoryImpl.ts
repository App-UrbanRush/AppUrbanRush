import type { IEarningsRepository } from "../../domain/interfaces/IEarningsRepository";
import type { CourierBalance } from "../../domain/types/earnings.types";
import { earningsApi } from "../api/earningsApi";

export class EarningsRepositoryImpl implements IEarningsRepository {
  async getCourierBalance(courierId: number): Promise<CourierBalance> {
    return earningsApi.getCourierBalance(courierId);
  }
}
