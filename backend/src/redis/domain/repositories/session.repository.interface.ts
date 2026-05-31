export interface ISessionRepository {
    save(userId: number, token: string, ttlSeconds: number): Promise<void>;
    find(userId: number): Promise<string | null>;
    delete(userId: number): Promise<void>;
  }