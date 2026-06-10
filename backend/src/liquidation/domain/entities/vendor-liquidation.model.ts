export class VendorLiquidationModel {
  constructor(
    public readonly liquidation_id: string | null,
    public readonly vendor_id: number,
    public readonly order_id: string,
    public readonly subtotal: number,
    public readonly platform_commission: number,
    public readonly vendor_net: number,
    public readonly status: string, // PENDING | PAID
    public readonly created_at: Date | null,
    public readonly paid_at: Date | null,
  ) {}
}
