import { Guild, TextChannel, User } from 'discord.js'
import LoggerSetting from 'src/schemas/LogSettingSchema'
import Embed from 'src/utils/Embed'
import { Event } from '../structures/Event'
export default new Event('inviteCreate', async (client, invite) => {
  const guild = invite.guild as Guild
  const inviter = invite.inviter as User
  const LoggerSettingDB = await LoggerSetting.findOne({guild_id: guild.id})
  if(!LoggerSettingDB) return
  if(!LoggerSettingDB.useing.inviteGuild) return
  const logChannel = guild.channels.cache.get(LoggerSettingDB.guild_channel_id) as TextChannel
  if(!logChannel) return
  const embed = new Embed(client, 'success')
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
