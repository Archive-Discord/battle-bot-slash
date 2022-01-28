import BotClient from "@client"

class BaseManager {
  public client: BotClient
  constructor(client: BotClient) {
    this.client = client
  }
}

export default BaseManager
