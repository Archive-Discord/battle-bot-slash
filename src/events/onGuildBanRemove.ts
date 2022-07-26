import { TextChannel, User } from 'discord.js'
import LoggerSetting from '../schemas/LogSettingSchema'
import Embed from '../utils/Embed'
import { Event } from '../structures/Event'

export default new Event('guildBanRemove', async (client, ban) => {
  const LoggerSettingDB = await LoggerSetting.findOne({
    guild_id: ban.guild.id
  })
  if (!LoggerSettingDB) return
  if (!LoggerSettingDB.useing.memberBan) return
  const logChannel = ban.guild.channels.cache.get(
    LoggerSettingDB.guild_channel_id
  ) as TextChannel
  if (!logChannel) return
  const fetchedLogs = await ban.guild.fetchAuditLogs({
    limit: 1,
    type: 'MEMBER_BAN_REMOVE'
  })
  const deletionLog = fetchedLogs.entries.first()
  const embed = new Embed(client, 'warn')
    .setTitle('멤버 차단 해제')
    .setAuthor(ban.user.username, ban.user.displayAvatarURL())
    .addFields({
      name: '유저',
      value: `<@${ban.user.id}>` + '(`' + ban.user.id + '`)'
    })
  if (!deletionLog) return await logChannel.send({ embeds: [embed] })
  const executor = deletionLog.executor as User
  const target = deletionLog.target as User
  if (target.id == ban.user.id) {
    embed.addFields('관리자', `<@${executor.id}>` + '(`' + executor.id + '`)')
    return await logChannel.send({ embeds: [embed] })
  } else {
    return await logChannel.send({ embeds: [embed] })
  }
})
