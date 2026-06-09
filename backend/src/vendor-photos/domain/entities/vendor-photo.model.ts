export class VendorPhotoModel {
  constructor(
    public readonly id: string | null,
    public readonly vendor_id: number,
    public readonly image_url: string,
    public readonly public_id: string,
    public readonly order: number,
    public readonly type: string,
    public readonly created_at?: Date,
  ) {}
}
