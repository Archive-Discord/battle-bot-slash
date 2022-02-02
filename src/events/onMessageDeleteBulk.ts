import BotClient from "@client"
import { MessageAttachment, Collection, Message, TextChannel } from "discord.js"
import LoggerSetting from "../schemas/LogSettingSchema"
import dateFormat from "../utils/DateFormatting"
import Embed from "../utils/LogEmbed"

export default {
  name: "messageDeleteBulk",
  async execute(client: BotClient, messages: Collection<string, Message>) {

    let message = messages.first() as Message
    let LoggerSettingDB = await LoggerSetting.findOne({
      guild_id: messages.first()?.guild?.id,
    })
    if (!LoggerSettingDB) return
    if (!LoggerSettingDB.useing.memberBan) return
    let logChannel = message.guild?.channels.cache.get(LoggerSettingDB.guild_channel_id) as TextChannel

    if (!logChannel) return

    let humanLog = `**삭제된 메시지들 #${message?.channel.type == 'GUILD_TEXT' ? message.channel.name : '알수없음'} (${message.channel.id
      }) in ${message.guild?.name} (${message.guild?.id})**`
    for (const message of [...messages.values()].reverse()) {
      humanLog += `\r\n\r\n[${dateFormat.date(Number(message.createdAt))}] ${message.author?.tag ?? "찾을 수 없음"
        } (${message.id})`
      humanLog += " : " + message.content
    }
    const attachment = new MessageAttachment(
      Buffer.from(humanLog, "utf-8"),
      "DeletedMessages.txt"
    )
    const msg = await logChannel.send({ files: [attachment] })
    let embed = new Embed(client, "error")
      .setTitle("메시지 대량 삭제")
      .addField("삭제된 메시지", `${messages.size}`)
      .addField("삭제된 메시지 확인", `[링크](https://txt.discord.website/?txt=${logChannel.id}/${msg.attachments.first()?.id}/DeletedMessages)`)

    return await logChannel.send({ embeds: [embed] })
  },
}
