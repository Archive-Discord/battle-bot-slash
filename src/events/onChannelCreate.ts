import { GuildAuditLogs, GuildAuditLogsEntry, GuildChannel, TextChannel, User } from 'discord.js'
import LoggerSetting from 'src/schemas/LogSettingSchema'
import Embed from 'src/utils/Embed'
import { Event } from '../structures/Event'

export default new Event('channelCreate', async (client, channel) => {
  let LoggerSettingDB = await LoggerSetting.findOne({guild_id: channel.guild.id})
  if(!LoggerSettingDB) return
  if(!LoggerSettingDB.useing.createChannel) return
  let logChannel = channel.guild.channels.cache.get(LoggerSettingDB.guild_channel_id) as TextChannel
  if(!logChannel) return
  let fetchedLogs = await channel.guild.fetchAuditLogs({
    limit: 1,
    type: 'CHANNEL_CREATE',
  })
  let embed = new Embed(client, 'success')
    .setTitle('채널 생성')
    .addFields({
      name: '채널',
      value: `<#${channel.id}>` + '(`' + channel.id + '`)'
    }, {
      name: '카테고리',
      value: channel.parent ? channel.parent.name : '없음'
    })
  if(!fetchedLogs) return await logChannel.send({embeds: [embed]})
  let deletionLog = fetchedLogs.entries.first() as GuildAuditLogsEntry
  let executor = deletionLog.executor as User
  let target = deletionLog.target as GuildChannel
    if(target.id === channel.id) {
      embed.addField('생성유저', `<@${executor.id}>` + '(`' + executor.id + '`)')
      return await logChannel.send({embeds: [embed]})
    } else {
      return await logChannel.send({embeds: [embed]})
    }
})
