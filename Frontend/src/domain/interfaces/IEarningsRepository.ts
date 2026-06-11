import type { CourierBalance } from "../types/earnings.types";

export interface IEarningsRepository {
  getCourierBalance(courierId: number): Promise<CourierBalance>;
}
