import BotClient from "@client"
import { Client, Invite, TextChannel } from"discord.js"
import { LoggerSetting } from"../schemas/LogSettingSchema"
import LogEmbed from"../utils/LogEmbed"

export default {
  name: "inviteCreate",
  /**
   *
   * @param {import('../structures/BotClient')} client
   * @param {Invite} invite
   */
  async execute(client: BotClient, invite: Invite) {


    let LoggerSettingDB = await LoggerSetting.findOne({
      guild_id: invite.guild && invite.guild.id,
    })
    if (!LoggerSettingDB) return
    if (!LoggerSettingDB.useing.memberBan) return

    let logChannel: TextChannel = invite.guild &&  invite.guild.channels.cache.get(
      LoggerSettingDB.guild_channel_id
    )
    if (!logChannel) return
    let embed = new LogEmbed(client as Client<true>, "success").setDescription(
      [
        `초대코드 생성 ${invite.channel ? `채널: ${invite.channel}` : ""}`,
        `코드: \`${invite.code}\``,
        `사용가능 횟수: \`${
          invite.maxUses === 0 ? "무제한" : invite.maxUses
        }\``,
        `사용 가능일: ${invite.maxAge != 0 ? invite.maxAge : "무제한"}`,
        `생성자: <@${invite.inviter && invite.inviter.id}>(\`${invite.inviter && invite.inviter.id}\`)`,
      ].join("\n")
    )
    return await logChannel.send({ embeds: [embed] })
  },
}
