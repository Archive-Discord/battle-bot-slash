import Logger from "@utils/Logger"
import BotClient from './structures/BotClient'

import config from '@config'
let logger = new Logger('main')

logger.log('Starting up...')

process.on('uncaughtException', (e) => logger.error(e.stack as string))
process.on('unhandledRejection', (e: Error) => logger.error(e.stack as string))


let client = new BotClient(config.bot.options)

client.start(config.bot.token)
