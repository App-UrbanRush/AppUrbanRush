export class CourierLocationModel {
  constructor(
    public readonly courier_id: number,
    public readonly order_id: string,
    public readonly lat: number,
    public readonly lng: number,
    public readonly accuracy: number | null,
    public readonly speed: number | null,
    public readonly heading: number | null,
    public readonly timestamp: Date,
  ) {}
}
