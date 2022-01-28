import Logger from "@utils/Logger"
const logger = new Logger('main')
import BotClient from './structures/BotClient'

import config from '@config'

logger.log('Starting up...')

process.on('uncaughtException', (e) => logger.error(e.stack as string))
process.on('unhandledRejection', (e: Error) => logger.error(e.stack as string))


let client = new BotClient(config.bot.options)


client.start(config.bot?.token)
