import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { IGPSRepository } from '../../domain/repositories/gps.repository.interface';
import { CourierLocationModel } from '../../domain/entities/courier-location.model';

@Injectable()
export class RedisGPSRepository implements IGPSRepository {
  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

  private buildKey(courierId: number): string {
    return `gps:courier:${courierId}`;
  }

  async saveLocation(location: CourierLocationModel, ttlSeconds: number): Promise<void> {
    const key = this.buildKey(location.courier_id);
    const payload = {
      courier_id: location.courier_id,
      order_id: location.order_id,
      lat: location.lat,
      lng: location.lng,
      accuracy: location.accuracy,
      speed: location.speed,
      heading: location.heading,
      timestamp: location.timestamp.toISOString(),
    };
    await this.cacheManager.set(key, JSON.stringify(payload), ttlSeconds * 1000);
  }

  async getLocation(courierId: number): Promise<CourierLocationModel | null> {
    const raw = await this.cacheManager.get<string>(this.buildKey(courierId));
    if (!raw) return null;

    const data = typeof raw === 'string' ? JSON.parse(raw) : (raw as any);
    return new CourierLocationModel(
      data.courier_id,
      data.order_id,
      data.lat,
      data.lng,
      data.accuracy ?? null,
      data.speed ?? null,
      data.heading ?? null,
      new Date(data.timestamp),
    );
  }

  async deleteLocation(courierId: number): Promise<void> {
    await this.cacheManager.del(this.buildKey(courierId));
  }
}
