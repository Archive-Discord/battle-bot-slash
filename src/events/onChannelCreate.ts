import { Client, GuildChannel } from "discord.js"
import { LoggerSetting } from "@schemas/LogSettingSchema"
import LogEmbed from "@utils/LogEmbed"
import BotClient from "@client"

export default {
  name: "channelCreate",
  async execute(client: BotClient, channel: GuildChannel) {
    let LoggerSettingDB = await LoggerSetting.findOne({
      guild_id: channel.guild.id,
    })
    if (!LoggerSettingDB) return
    if (!LoggerSettingDB.useing.createChannel) return
    let logChannel = channel.guild.channels.cache.get(
      LoggerSettingDB.guild_channel_id
    )
    if (!logChannel) return
    if (!logChannel.isText()) return
    let embed = new LogEmbed(client as Client<true>, "success")
      .setDescription("채널 생성")
      .addFields(
        {
          name: "채널",
          value: `<#${channel.id}>` + "(`" + channel.id + "`)",
        },
        {
          name: "카테고리",
          value: channel.parent?.name ?? "N/A",
        }
      )
    return await logChannel.send({ embeds: [embed] })
  },
}
