import BotClient from "@client"
import CommandManager from "@managers/CommandManager"
import ErrorManager from "@managers/ErrorManager"
import { Message } from "discord.js"

export default {
  name: "messageCreate",
  async execute(client: BotClient, message: Message) {
    if (!message.guild) return message.reply("Guild not found")
    let commandManager = new CommandManager(client)
    let errorManager = new ErrorManager(client)

    message.channel.messages.fetch()

    if (message.author.bot) return
    if (message.channel.type === "DM") return
    if (!message.content.startsWith(client.config.bot.prefix)) return

    let args = message.content
      .slice(client.config.bot.prefix.length)
      .trim()
      .split(/ +/g)

    let commandName = args.shift()?.toLowerCase()
    let command = commandManager.get(commandName as string)

    await client.dokdo.run(message)

    try {
      if (command?.isSlash) return message.reply('해당 명령어는 (/)커맨드만 사용 가능합니다')

      await command?.execute(client, message, args)
    } catch (error: any) {
      errorManager.report(error, { executer: message })
    }
  },
}
