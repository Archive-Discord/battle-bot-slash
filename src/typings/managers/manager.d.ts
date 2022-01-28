import BotClient from "@client"

interface ManagerClass {
  client: BotClient
}

export default ManagerClass

export interface ErrorExecuter {
  executer: Message | CommandInteraction | any
  userSend?: boolean
}
