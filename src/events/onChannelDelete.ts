import { Client, GuildChannel } from "discord.js"
import LoggerSetting from "@schemas/LogSettingSchema"
import LogEmbed from "@utils/LogEmbed"
import BotClient from "@client"
import Mongoose  from "mongoose"

export default {
  name: "channelDelete",
  async execute(client: BotClient, channel: GuildChannel) {

    let LoggerSettingDB = await LoggerSetting.findOne({
      guild_id: channel.guild.id,
    })
    if (!LoggerSettingDB) return
    if (!LoggerSettingDB.useing.deleteChannel) return
    let logChannel = channel.guild.channels.cache.get(
      LoggerSettingDB.guild_channel_id
    )
    if (!logChannel || !logChannel.isText()) return
    let embed = new LogEmbed(client as Client<true>, "error")
      .setDescription("채널 삭제")
      .addFields(
        {
          name: "채널",
          value: `${channel.name}` + "(`" + channel.id + "`)",
        },
        {
          name: "카테고리",
          value: channel.parent ? channel.parent.name : "_#N/A",
        }
      )
    return await logChannel.send({ embeds: [embed] })
  },
}
