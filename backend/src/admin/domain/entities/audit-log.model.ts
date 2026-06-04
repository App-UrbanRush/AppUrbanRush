export class AuditLogModel {
  constructor(
    public id: string | null,
    public action: string,
    public entity: string,
    public entity_id: string | number,
    public performed_by: number,
    public performed_by_email: string,
    public details: Record<string, any>,
    public created_at: Date | null,
  ) {}
}
