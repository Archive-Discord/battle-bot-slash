import Discord ,{ Guild, GuildAuditLogs, GuildAuditLogsEntry, GuildChannel, TextChannel, User } from 'discord.js'
import CommandManager from 'src/managers/CommandManager'
import ErrorManager from 'src/managers/ErrorManager'
import LoggerSetting from 'src/schemas/LogSettingSchema'
import Embed from 'src/utils/Embed'
import Logger from 'src/utils/Logger'
import { Event } from '../structures/Event'
const log = new Logger('GuildCreateEvent')
export default new Event('inviteCreate', async (client, invite) => {
  let guild = invite.guild as Guild
  let inviter = invite.inviter as User
  let LoggerSettingDB = await LoggerSetting.findOne({guild_id: guild.id})
  if(!LoggerSettingDB) return
  if(!LoggerSettingDB.useing.inviteGuild) return
  let logChannel = guild.channels.cache.get(LoggerSettingDB.guild_channel_id) as TextChannel
  if(!logChannel) return
  let embed = new Embed(client, 'success')
    .setTitle('초대코드')
    .setDescription([
      `초대코드 생성 ${invite.channel ? `채널: ${invite.channel}` : ''}`,
      `코드: \`${invite.code}\``,
      `사용가능 횟수: \`${invite.maxUses ===0 ? '무제한': invite.maxUses}\``,
      `사용 가능일: ${invite.maxAge != 0 ? invite.maxAge : '무제한'}`,
      `생성유저: <@${inviter.id}>(\`${inviter.id}\`)`,
    ].join('\n'))
  return await logChannel.send({embeds: [embed]})
})
