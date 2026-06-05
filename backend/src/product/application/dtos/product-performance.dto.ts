export interface ProductPerformanceDTO {
  product_id: string;
  name: string;
  image_url: string | null;
  category: string;
  total_sold: number;
}