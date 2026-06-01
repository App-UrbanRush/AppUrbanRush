export class OrderItemModel {
    constructor(
      public product_id: string,
      public product_name: string,
      public quantity: number,
      public unit_price: number,
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
      public total: number,
      public items: OrderItemModel[],
      public created_at: Date | null,
    ) {}
  }