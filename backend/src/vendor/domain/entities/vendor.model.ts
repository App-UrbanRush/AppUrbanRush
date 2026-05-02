export class Vendor {
  constructor(
    public readonly vendor_id: number | null,
    public readonly business_name: string,
    public readonly business_type: string,
    public readonly address: string,
    public readonly phone: string,
    public readonly description: string | null,
    public readonly status: string, // PENDING, ACTIVE, INACTIVE, REJECTED
    public readonly user_id: number,
  ) {}
}