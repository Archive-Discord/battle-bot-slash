import Discord, { Client, Guild, TextChannel } from "discord.js"
import Embed from "@utils/Embed"
import Logger from "@utils/Logger"
import uuid from "uuid"

import config from "@config"
import { ErrorExecuter } from "@types"
import BotClient from "@client"


/**
 * @extends BaseManager
 */
export default class ErrorManager {
  private client: BotClient
  private logger: Logger

  constructor(client: BotClient) {
    this.client = client
    this.logger = new Logger("bot")
  }

  public report(error: Error, user: ErrorExecuter) {
    this.logger.error(error.stack as string)

    const date = (Number(new Date()) / 1000) | 0
    const errorText = `**[<t:${date}:T> ERROR]** ${error.stack}`
    const errorCode = uuid.v4()

    this.client.errors.set(errorCode, error.stack as string)

    const errorEmbed = new Embed(this.client as Client<true>, "error")
      .setTitle("오류가 발생했습니다.")
      .setDescription(
        "명령어 실행 도중에 오류가 발생하였습니다. 개발자에게 오류코드를 보내 개발에 지원해주세요."
      )
      .addField("오류 코드", errorCode, true)
    const thisGuild = this.client.guilds.cache.get(user.executer.guildId as string) as Guild
    //let thisChannel = thisGuild.channels.cache.get(user.channelId)
    const reportEmbed = new Embed(this.client as Client<true>, "error")
      .setTitle("오류가 발생했습니다.")
      .addField("요청서버 이름", user.executer.guildId as string, true)
      .addField("요청서버 ID", thisGuild.name, true)
      .addField("오류 코드", errorCode, true)

    user.executer.reply({ embeds: [errorEmbed] })
    if (config.report.type == "webhook") {
      const webhook = new Discord.WebhookClient({
        url: config.report.webhook.url,
      })

      webhook.send(errorText)
      webhook.send({ embeds: [reportEmbed] })
    } else if (config.report.type == "text") {
      const guild = this.client.guilds.cache.get(config.report.text.guildID) as Guild
      const channel = guild.channels.cache.get(
        config.report.text.channelID
      ) as TextChannel

      channel.send(errorText)
      channel.send({ embeds: [reportEmbed] })
    }
  }
}
