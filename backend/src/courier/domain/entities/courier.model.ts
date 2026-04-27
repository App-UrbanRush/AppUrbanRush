export class Courier {
    constructor(
      public readonly couriers_id: number | null,
      public readonly vehicle_type: string,
      public readonly vehicle_plate: string | null,
      public readonly soat_number: string | null,
      public readonly status: string, // PENDING, ACTIVE, INACTIVE
      public readonly user_id: number,
    ) {}
  }