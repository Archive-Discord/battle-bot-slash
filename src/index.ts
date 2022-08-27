import web from './server';
import { client } from './bot';
import { ShardingManager } from 'discord.js';
import config from '../config';
import chalk from 'chalk';
import { name } from '../package.json';
import Logger from './utils/Logger';
import { readFileSync } from 'fs';
import { join } from 'path';
import { setTimeout } from 'timers/promises';

const loggerWeb = new Logger('web');
const logger = new Logger('ShardManager');

const main = async () => {
  console.log(
    chalk.cyanBright(`
                    =========================================================
  
  
                                ${name}@${config.BUILD_NUMBER}
                              Version : ${config.BUILD_VERSION}
  
  
                    =========================================================`),
  );

  if (!config.bot.sharding) {
    require('./bot');
  } else {
    try {
      if (!readFileSync(join(__dirname, './bot.ts'))) return;
      for (let index = 0; index < 6; index++) {
        console.log(' ');
      }
      logger.warn('Sharding system not supported typescript file');
      for (let index = 0; index < 6; index++) {
        console.log(' ');
      }
      await setTimeout(3000);
      require('./bot');
    } catch (e) {
      const manager = new ShardingManager('./src/bot.js', config.bot.shardingOptions);

      manager.spawn();
      manager.on('shardCreate', async (shard) => {
        logger.info(`Shard #${shard.id} created.`);
      });
    }
  }
};

main();
