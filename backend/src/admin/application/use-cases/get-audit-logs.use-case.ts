import { Injectable, Inject } from '@nestjs/common';
import { IAuditLogRepository } from '../../domain/repositories/audit-log.repository.interface';

@Injectable()
export class GetAuditLogsUseCase {
  constructor(
    @Inject('IAuditLogRepository')
    private readonly auditRepo: IAuditLogRepository,
  ) {}

  async execute(limit?: number) {
    return this.auditRepo.findAll(limit);
  }
}
