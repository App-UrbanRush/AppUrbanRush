export class CategoryModel {
  constructor(
    public category_id: string | null,
    public vendor_id: number,
    public name: string,
    public image_url: string,
  ) {}
}
