export class ReviewModel {
  constructor(
    public readonly review_id: string | null,
    public readonly vendor_id: number,
    public readonly user_id: number,
    public readonly order_id: string | null,
    public readonly rating: number,
    public readonly comment: string,
    public readonly created_at: Date | null,
  ) {}
}