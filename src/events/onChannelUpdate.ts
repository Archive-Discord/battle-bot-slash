import {
  GuildAuditLogsEntry,
  GuildChannel,
  TextChannel,
  User
} from 'discord.js'
import LoggerSetting from '../schemas/LogSettingSchema'
import Embed from '../utils/Embed'
import { Event } from '../structures/Event'

export default new Event(
  'channelUpdate',
  async (client, newChannel, oldChannel) => {
    if (oldChannel.type === 'DM') return
    if (newChannel.type === 'DM') return
    const LoggerSettingDB = await LoggerSetting.findOne({
      guild_id: newChannel.guild.id
    })
    if (!LoggerSettingDB) return
    if (!LoggerSettingDB.useing.editChannel) return
    const logChannel = newChannel.guild.channels.cache.get(
      LoggerSettingDB.guild_channel_id
    ) as TextChannel
    if (!logChannel) return
    const fetchedLogs = await newChannel.guild.fetchAuditLogs({
      limit: 1,
      type: 'CHANNEL_UPDATE'
    })
    let updated = false
    const embed = new Embed(client, 'warn').setTitle('채널 수정').addFields({
      name: '채널',
      value: `<#${newChannel.id}>` + '(`' + newChannel.id + '`)'
    })
    if (oldChannel.name != newChannel.name) {
      embed.addFields(
        '이름 수정',
        '`' + oldChannel.name + '`' + ' -> ' + '`' + newChannel.name + '`'
      )
      updated = true
    }
    if (oldChannel.parent != newChannel.parent) {
      embed.addFields(
        '카테고리 변경',
        '`' +
          (oldChannel.parent ? oldChannel.parent.name : '없음') +
          '`' +
          ' -> ' +
          '`' +
          (newChannel.parent ? newChannel.parent.name : '없음') +
          '`'
      )
      updated = true
    }

    if (updated) {
      if (!fetchedLogs) return await logChannel.send({ embeds: [embed] })
      const deletionLog =
        fetchedLogs.entries.first() as unknown as GuildAuditLogsEntry
      const executor = deletionLog.executor as User
      const target = deletionLog.target as GuildChannel
      if (target.id !== newChannel.id)
        return await logChannel.send({ embeds: [embed] })
      embed.addFields(
        '수정유저',
        `<@${executor.id}>` + '(`' + executor.id + '`)'
      )
      return await logChannel.send({ embeds: [embed] })
    }
  }
)
