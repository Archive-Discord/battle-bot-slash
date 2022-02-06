import { Event } from '../structures/Event'
import CommandManager from '../managers/CommandManager'
import ErrorManager from '../managers/ErrorManager'
import { MessageCommand } from 'src/structures/Command'
import config from 'config'
import LoggerSetting from 'src/schemas/LogSettingSchema'
import Embed from 'src/utils/Embed'
import { GuildChannel, TextChannel, User } from 'discord.js'

export default new Event('messageReactionRemoveAll', async (client, message) => {
  const { guild } = message
  if(!guild) return
  if(message.partial) await message.fetch()

  let LoggerSettingDB = await LoggerSetting.findOne({guild_id: guild.id})
  if(!LoggerSettingDB) return
  if(!LoggerSettingDB.useing.reactMessage) return

  let logChannel = guild.channels.cache.get(LoggerSettingDB.guild_channel_id) as TextChannel
  if(!logChannel) return
  let embed = new Embed(client, 'error')
    .setTitle('모든 반응 삭제')
    .addField('채널', `<#${message.channel.id}>` + '(`' + message.channel.id + '`)')
    .addField('메시지', `[메시지](${message.url})`)

  
  return await logChannel.send({embeds: [embed]})
})
