export class OrderItemModel {
  constructor(
    public product_id: string,
    public product_name: string,
    public quantity: number,
    public unit_price: number,
    public image_url: string | null = null,
  ) {}
}

export class OrderModel {
  constructor(
    public order_id: string | null,
    public user_id: number,
    public vendor_id: number,
    public courier_id: number | null,
    public status: string,
    public delivery_address: string,
    public subtotal: number,
    public delivery_fee: number,
    public platform_commission: number,
    public total: number,
    public items: OrderItemModel[],
    public created_at: Date | null,
    public delivery_code: string | null = null,
    public delivery_attempts: number = 0,
    public delivery_blocked: boolean = false,
    public customer_lat: number | null = null,
    public customer_lng: number | null = null,
  ) {}
}
