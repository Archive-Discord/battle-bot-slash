import BotClient from "@client"
import ManagerClass from "@types/managers/manager"

class i18nManager implements ManagerClass {
  public client: BotClient

  constructor(client: BotClient) {
    this.client = client
  }

  async load() {
    // Todo: Load i18n files
  }
}

export default i18nManager
