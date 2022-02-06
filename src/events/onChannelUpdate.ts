import { GuildAuditLogs, GuildAuditLogsEntry, GuildChannel, TextChannel, User } from 'discord.js'
import LoggerSetting from 'src/schemas/LogSettingSchema'
import Embed from 'src/utils/Embed'
import { Event } from '../structures/Event'

export default new Event('channelUpdate', async (client, newChannel, oldChannel) => {
  if(oldChannel.type === "DM") return
  if(newChannel.type === "DM") return
  let LoggerSettingDB = await LoggerSetting.findOne({guild_id: newChannel.guild.id})
  if(!LoggerSettingDB) return
  if(!LoggerSettingDB.useing.editChannel) return
  let logChannel = newChannel.guild.channels.cache.get(LoggerSettingDB.guild_channel_id) as TextChannel
  if(!logChannel) return
  let fetchedLogs = await newChannel.guild.fetchAuditLogs({
    limit: 1,
    type: 'CHANNEL_UPDATE',
  })
  let updated = false
  let embed = new Embed(client, 'warn')
    .setTitle('채널 수정')
    .addFields({
      name: '채널',
      value: `<#${newChannel.id}>` + '(`' + newChannel.id + '`)'
    })
  if (oldChannel.name != newChannel.name) {
    embed.addField('이름 수정', '`' + oldChannel.name + '`' + ' -> ' + '`' + newChannel.name + '`')
    updated = true
  }
  if (oldChannel.parent != newChannel.parent) {
    embed.addField('카테고리 변경', '`' + (oldChannel.parent ? oldChannel.parent.name : '없음') + '`' + ' -> ' + '`' + (newChannel.parent ? newChannel.parent.name : '없음') + '`')
    updated = true
  }

  if(updated) {
    if(!fetchedLogs) return await logChannel.send({embeds: [embed]})
    let deletionLog = fetchedLogs.entries.first() as GuildAuditLogsEntry
    let executor = deletionLog.executor as User
    let target = deletionLog.target as GuildChannel
    if(target.id !== newChannel.id) return await logChannel.send({embeds: [embed]})
    embed.addField('수정유저', `<@${executor.id}>` + '(`' + executor.id + '`)')
    return await logChannel.send({embeds: [embed]})
  }
})
