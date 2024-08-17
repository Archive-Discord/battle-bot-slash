import Logger from '../utils/Logger';
import BaseManager from './BaseManager';
import { createClient } from 'redis';
import BotClient from '../structures/BotClient';

/**
 * @extends {BaseManager}
 */
export default class RedisManager extends BaseManager {
  private logger: Logger;

  constructor(client: BotClient) {
    super(client);

    this.logger = new Logger('RedisManager');
  }

  async load() {
    this.logger.log('Loading Redis manager...');
    this.client.redisClient = createClient({
      url: this.client.config.redis.url,
    })

    await this.client.redisClient.connect().then(() => {
      this.logger.log('Connected to Redis.');
    }).catch((error) => {
      this.logger.error(`Error connecting to Redis: ${error}`);
    });
  }
}