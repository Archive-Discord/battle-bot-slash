import { GuildMember } from "discord.js"
import LoggerSetting from "../schemas/LogSettingSchema"
import BotClient from "@client"
import LogEmbed from "../utils/LogEmbed"

export default {
  name: "guildMemberAdd",
  /**
   *
   * @param {import('../structures/BotClient')} client
   * @param {GuildMember} member
   */
  async execute(client: BotClient, member: GuildMember) {
    let LoggerSettingDB = await LoggerSetting.LoggerSetting.findOne({// 커밋
      guild_id: member.guild.id,
    })
    if (!LoggerSettingDB) return
    if (!LoggerSettingDB.useing.memberJoin) return
    let logChannel = member.guild.channels.cache.get(
      LoggerSettingDB.guild_channel_id
    )
    if (!logChannel) return
    let embed = new LogEmbed(client, "success")
      .setDescription("멤버 추가")
      .setAuthor(member.user.username, member.user.displayAvatarURL())
      .addFields({
        name: "유저",
        value: `<@${member.user.id}>` + "(`" + member.user.id + "`)",
      })
    return await logChannel.send({ embeds: [embed] })
  },
}
