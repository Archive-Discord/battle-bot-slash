import { Event } from '../structures/Event'
import config from '../../config'
import LoggerSetting from '../schemas/LogSettingSchema'
import Embed from '../utils/Embed'
import { TextChannel, User } from 'discord.js'

export default new Event('messageDelete', async (client, message) => {
  if (!message.content) return
  if (message.content.startsWith(config.bot.prefix)) return
  if (message.author?.id == client.user?.id) return
  if (!message.guild) return
  if (!message.content && message.attachments.size == 0 && message.embeds[0])
    return
  const LoggerSettingDB = await LoggerSetting.findOne({
    guild_id: message.guild.id
  })
  if (!LoggerSettingDB) return
  if (!LoggerSettingDB.useing.deleteMessage) return
  const logChannel = message.guild.channels.cache.get(
    LoggerSettingDB.guild_channel_id
  ) as TextChannel
  if (!logChannel) return
  if (message.partial) message = await message.fetch()

  if (message.content.length > 1024) {
    message.content = message.content.slice(0, 700) + '...'
  }
  const embed = new Embed(client, 'error').setTitle('메시지 삭제')
  embed.addField(
    '채널',
    `<#${message.channel.id}>` + '(`' + message.channel.id + '`)'
  )
  embed.addField(
    '작성자',
    `<@${message.author.id}>` + '(`' + message.author.id + '`)'
  )
  if (message.content.length > 0) embed.addField('내용', `${message.content}`)
  if (message.attachments.size > 0) {
    embed.addField(
      '파일',
      message.attachments.map((file) => `[링크](${file.url})`).join('\n')
    )
  }
  const fetchedLogs = await message.guild?.fetchAuditLogs({
    limit: 1,
    type: 'MESSAGE_DELETE'
  })
  if (!fetchedLogs) return await logChannel.send({ embeds: [embed] })
  const deletionLog = fetchedLogs.entries.first()
  if (!deletionLog) return await logChannel.send({ embeds: [embed] })
  const target = deletionLog.target as User
  const executor = deletionLog.executor as User
  const extra = deletionLog.extra as any
  if (!deletionLog) return await logChannel.send({ embeds: [embed] })
  if (
    extra.channel.id === message.channel.id &&
    target.id === message.author.id &&
    deletionLog.createdTimestamp > Date.now() - 60 * 1000
  ) {
    embed.addField('삭제유저', `<@${executor.id}>` + '(`' + executor.id + '`)')
    return await logChannel.send({ embeds: [embed] })
  }
  return await logChannel.send({ embeds: [embed] })
})
