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

    message.guild.channels.cache.forEach(async (channel) => {
      if (channel.isText())
        return channel.messages.fetch().catch(() => { })
    })

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
      await command?.execute(client, message, args)
    } catch (error: any) {
      errorManager.report(error, { executer: message })
    }
  },
}
