export class Vendor {
  constructor(
    public readonly vendor_id: number | null,
    public readonly business_name: string,
    public readonly business_type: string,
    public readonly address: string,
    public readonly phone: string,
    public readonly description: string | null,
    public readonly status: string, // PENDING, ACTIVE, INACTIVE, REJECTED, VERIFIED
    public readonly user_id: number,
    public readonly logo_url: string | null = null,
    public readonly storefront_image_url: string | null = null,
  ) {}
}
