import {
  GuildAuditLogsEntry,
  GuildChannel,
  TextChannel,
  User
} from 'discord.js'
import LoggerSetting from '../schemas/LogSettingSchema'
import Embed from '../utils/Embed'
import { Event } from '../structures/Event'

export default new Event('channelDelete', async (client, channel) => {
  if (channel.type === 'DM') return
  const LoggerSettingDB = await LoggerSetting.findOne({
    guild_id: channel.guild.id
  })
  if (!LoggerSettingDB) return
  if (!LoggerSettingDB.useing.deleteChannel) return
  const logChannel = channel.guild.channels.cache.get(
    LoggerSettingDB.guild_channel_id
  ) as TextChannel
  if (!logChannel) return
  const fetchedLogs = await channel.guild.fetchAuditLogs({
    limit: 1,
    type: 'CHANNEL_DELETE'
  })
  const embed = new Embed(client, 'error').setTitle('채널 삭제').addFields(
    {
      name: '채널',
      value: `#${channel.name}` + '(`' + channel.id + '`)'
    },
    {
      name: '카테고리',
      value: channel.parent ? channel.parent.name : '없음'
    }
  )
  if (!fetchedLogs) return await logChannel.send({ embeds: [embed] })
  const deletionLog = fetchedLogs.entries.first() as GuildAuditLogsEntry
  const executor = deletionLog.executor as User
  const target = deletionLog.target as GuildChannel
  if (target.id === channel.id) {
    embed.addField('삭제유저', `<@${executor.id}>` + '(`' + executor.id + '`)')
    return await logChannel.send({ embeds: [embed] })
  } else {
    return await logChannel.send({ embeds: [embed] })
  }
})
