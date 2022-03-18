import { ShardingManager } from 'discord.js'
import config from '../config'
import chalk from 'chalk'
import { name } from '../package.json'
import Logger from './utils/Logger'
import web from './server'
import { client } from './bot'

const logger = new Logger('shard')
const loggerWeb = new Logger('web')

console.log(
  chalk.cyanBright(`
                  =========================================================


                              ${name}@${config.BUILD_NUMBER}
                            Version : ${config.BUILD_VERSION}


                  =========================================================`)
)

if (!config.bot.sharding) {
  require('./bot')
} else {
  const manager = new ShardingManager(
    './src/bot.js',
    config.bot.shardingOptions
  )

  manager.spawn()
  manager.on('shardCreate', async (shard) => {
    logger.info(`Shard #${shard.id} created.`)
  })
}

try {
  web(client)
} catch(e) {
  loggerWeb.error(e as string)
}
