import { TextChannel, User } from 'discord.js'
import LoggerSetting from 'src/schemas/LogSettingSchema'
import Embed from 'src/utils/Embed'
import { Event } from '../structures/Event'

export default new Event('guildBanAdd', async (client, ban) => {
  const LoggerSettingDB = await LoggerSetting.findOne({guild_id: ban.guild.id})
  if(!LoggerSettingDB) return
  if(!LoggerSettingDB.useing.memberBan) return
  const logChannel = ban.guild.channels.cache.get(LoggerSettingDB.guild_channel_id) as TextChannel
  if(!logChannel) return
  const fetchedLogs = await ban.guild.fetchAuditLogs({
    limit: 1,
    type: 'MEMBER_BAN_ADD'
  })
  const deletionLog = fetchedLogs.entries.first()
  const embed = new Embed(client, 'error')
  .setTitle('멤버 차단')
  .setAuthor(ban.user.username, ban.user.displayAvatarURL())
  .addFields({
    name: '유저',
    value: `<@${ban.user.id}>` + '(`' + ban.user.id + '`)'
  })
  if(!deletionLog) return await logChannel.send({embeds: [embed]})
  const executor = deletionLog.executor as User
  const target = deletionLog.target as User
  if(target.id == ban.user.id) {
    embed.addField('관리자', `<@${executor.id}>` + '(`' + executor.id + '`)')
    return await logChannel.send({embeds: [embed]})
  } else {
    return await logChannel.send({embeds: [embed]})
  }
})
