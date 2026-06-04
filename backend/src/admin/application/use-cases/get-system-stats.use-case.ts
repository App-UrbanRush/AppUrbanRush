import { Injectable } from '@nestjs/common';
import { StatsService } from '../../infrastructure/services/stats.service';

@Injectable()
export class GetSystemStatsUseCase {
  constructor(private readonly statsService: StatsService) {}

  async execute() {
    return this.statsService.getSystemStats();
  }
}
