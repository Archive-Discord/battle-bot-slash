import BotClient from '../structures/BotClient'

class i18nManager {
  private client: BotClient

  constructor(client: BotClient) {
    this.client = client
  }
}

export default i18nManager
