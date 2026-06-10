export class CourierEarningModel {
  constructor(
    public readonly earning_id: string | null,
    public readonly courier_id: number,
    public readonly order_id: string,
    public readonly delivery_fee: number,
    public readonly status: string, // PENDING | PAID
    public readonly created_at: Date | null,
    public readonly paid_at: Date | null,
  ) {}
}
