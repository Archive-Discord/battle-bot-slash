import BotClient from '@client'
import Logger from'@utils/Logger'
let logger = new Logger('bot')

export default {
  name: 'ready',
  once: true,
  /**
   * @param {import('../structures/BotClient')} client 
   */
  async execute(client: BotClient) {
    logger.info(`Logged ${client.user?.username}`)
  }
}