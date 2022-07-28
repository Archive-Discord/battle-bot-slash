import i18next, { i18n } from 'i18next'
import BotClient from '../structures/BotClient'
import Logger from '../utils/Logger'

export default class i18nManager {
  private client: BotClient
  private logger: Logger = new Logger('i18nManager')
  public i18n: i18n = i18next

  constructor(client: BotClient) {
    this.client = client
  }

  public async load() {
    this.logger.info('Loading i18n...')
    this.i18n.on('initialized', async (lang) => {
      this.logger.info('Succesfully loaded i18n.')
    })
    await i18next.init(this.client.config.i18n.options)

    const en = await this.i18n.changeLanguage('en')

    this.logger.info(`Test: English: ${en('main.hello.world')}`)

    const ko = await this.i18n.changeLanguage('ko')

    this.logger.info(`Test: Korea: ${ko('main.hello.world')}`)
  }
}
