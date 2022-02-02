import BotClient from '@client'
import { Client, Guild, Invite, TextChannel } from 'discord.js'
import LoggerSetting from '../schemas/LogSettingSchema'
import LogEmbed from '../utils/LogEmbed'

export default {
  name: 'inviteDelete',
  /**
   * 
   * @param {import('../structures/BotClient')} client 
   * @param {Invite} invite
   */
  async execute(client: BotClient, invite: Invite) {
    invite.guild = invite.guild as Guild

    let LoggerSettingDB = await LoggerSetting.findOne({ guild_id: invite.guild.id })
    if (!LoggerSettingDB) return
    if (!LoggerSettingDB.useing.memberBan) return

    let logChannel = invite.guild.channels.cache.get(LoggerSettingDB.guild_channel_id) as TextChannel

    if (!logChannel) return

    let embed = new LogEmbed(client as Client<true>, 'error')
      .setDescription('초대코드 삭제')
      .addField('초대코드', invite.code)

    return await logChannel.send({ embeds: [embed] })
  }
}
