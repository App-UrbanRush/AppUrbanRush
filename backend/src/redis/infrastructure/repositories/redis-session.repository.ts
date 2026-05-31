import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { ISessionRepository } from '../../domain/repositories/session.repository.interface';

@Injectable()
export class RedisSessionRepository implements ISessionRepository {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async save(userId: number, token: string, ttlSeconds: number): Promise<void> {
    await this.cacheManager.set(`session:${userId}`, token, ttlSeconds * 1000); 
  }

  async find(userId: number): Promise<string | null> {
    return await this.cacheManager.get<string>(`session:${userId}`) ?? null;
  }

  async delete(userId: number): Promise<void> {
    await this.cacheManager.del(`session:${userId}`);
  }
}