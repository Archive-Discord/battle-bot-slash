import { GuildMember } from "discord.js"

import { GuildMember } from"discord.js")
import { LoggerSetting } from"../schemas/LogSettingSchema")
import LogEmbed from"../utils/LogEmbed")

export default {
  name: "guildMemberRemove",
  /**
   *
   * @param {import('../structures/BotClient')} client
   * @param {GuildMember} member
   */
  async execute(client, member: GuildMember) {
    let LoggerSettingDB = await LoggerSetting.findOne({
      guild_id: member.guild.id,
    })
    if (!LoggerSettingDB) return
    if (!LoggerSettingDB.useing.memberLeft) return
    let logChannel = member.guild.channels.cache.get(
      LoggerSettingDB.guild_channel_id
    )
    if (!logChannel) return
    let embed = new LogEmbed(client, "error")
      .setDescription("멤버 퇴장")
      .setAuthor(member.user.username, member.user.displayAvatarURL())
      .addFields({
        name: "유저",
        value: `<@${member.user.id}>` + "(`" + member.user.id + "`)",
      })
    return await logChannel.send({ embeds: [embed] })
  },
}
