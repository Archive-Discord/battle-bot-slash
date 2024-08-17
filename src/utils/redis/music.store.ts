import { QueueStoreManager, StoredQueue } from "lavalink-client";
import { RedisClientType } from "redis";

export class MusicStore implements QueueStoreManager {
  private redis: RedisClientType
  constructor(redisClient: RedisClientType) {
    this.redis = redisClient;
  }

  async get(guildId: unknown): Promise<any> {
    return await this.redis.get(this.id(guildId));
  }
  async set(guildId: unknown, stringifiedQueueData: any): Promise<any> {
    // await this.delete(guildId); // redis requires you to delete it first;
    return await this.redis.set(this.id(guildId), stringifiedQueueData);
  }
  async delete(guildId: unknown): Promise<any> {
    return await this.redis.del(this.id(guildId));
  }
  async parse(stringifiedQueueData: unknown): Promise<Partial<StoredQueue>> {
    return JSON.parse(stringifiedQueueData as string);
  }
  async stringify(parsedQueueData: unknown): Promise<any> {
    return JSON.stringify(parsedQueueData);
  }
  // you can add more utils if you need to...
  private id(guildId: unknown): string {
    return `lavalinkqueue_${guildId}`; // transform the id
  }
}

export class MusicSessionStore {
  private redis: RedisClientType
  constructor(redisClient: RedisClientType) {
    this.redis = redisClient;
  }

  async get(guildId: string): Promise<string> {
    return await this.redis.get(this.id(guildId)) as string;
  }
  async set(guildId: string, sessionId: string): Promise<any> {
    return await this.redis.set(this.id(guildId), sessionId);
  }
  async delete(guildId: string): Promise<any> {
    return await this.redis.del(this.id(guildId));
  }
  private id(guildId: unknown): string {
    return `lavalinksession_${guildId}`; // transform the id
  }
}
