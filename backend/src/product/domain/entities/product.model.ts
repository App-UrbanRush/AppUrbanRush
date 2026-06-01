export class ProductModel {
    constructor(
      public product_id: string | null, 
      public vendor_id: number,
      public name: string,
      public description: string,
      public price: number,
      public image_url: string | null,
      public category: string,
      public is_available: boolean,
      public stock: number,
    ) {}
  }