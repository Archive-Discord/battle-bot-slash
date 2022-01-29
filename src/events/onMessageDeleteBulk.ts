import { MessageAttachment, Collection, Message } from "discord.js"
import { LoggerSetting } from"../schemas/LogSettingSchema"
import dateFormat from"../utils/DateFormatting"
import Embed from"../utils/LogEmbed"

export default {
  name: "messageDeleteBulk",
  /**
   * @param {import('../structures/BotClient')} client
   * @param {Collection<import('discord.js').Snowflake, Message>} messages
   */
  async execute(client, messages) {
    let LoggerSettingDB = await LoggerSetting.findOne({
      guild_id: messages.first().guild.id,
    })
    if (!LoggerSettingDB) return
    if (!LoggerSettingDB.useing.memberBan) return
    let logChannel = messages
      .first()
      .guild.channels.cache.get(LoggerSettingDB.guild_channel_id)
    if (!logChannel) return
    let humanLog = `**삭제된 메시지들 #${messages.first().channel.name} (${
      messages.first().channel.id
    }) in ${messages.first().guild.name} (${messages.first().guild.id})**`
    for (const message of [...messages.values()].reverse()) {
      humanLog += `\r\n\r\n[${dateFormat.date(message.createdAt)}] ${
        message.author?.tag ?? "찾을 수 없음"
      } (${message.id})`
      humanLog += " : " + message.content
    }
    const attachment = new MessageAttachment(
      Buffer.from(humanLog, "utf-8"),
      "DeletedMessages.txt"
    )
    const msg = await logChannel.send({ files: [attachment] })
    let embed = new Embed(client, "error").setTitle("메시지 대량 삭제")
    embed.addField("삭제된 메시지", `${messages.size}`)
    embed.addField(
      "삭제된 메시지 확인",
      `[링크](https://txt.discord.website/?txt=${logChannel.id}/${
        msg.attachments.first().id
      }/DeletedMessages)`
    )
    return await logChannel.send({ embeds: [embed] })
  },
}
