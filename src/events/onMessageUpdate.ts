import { Event } from '../structures/Event'
import CommandManager from '../managers/CommandManager'
import ErrorManager from '../managers/ErrorManager'
import { MessageCommand } from 'src/structures/Command'
import config from 'config'
import LoggerSetting from 'src/schemas/LogSettingSchema'
import Embed from 'src/utils/Embed'
import { GuildChannel, TextChannel, User } from 'discord.js'

export default new Event('messageUpdate', async (client, oldMessage, newMessage) => {
  if(!newMessage.guild) return
  if(oldMessage.partial) oldMessage = await oldMessage.fetch()
  if(newMessage.partial) newMessage = await newMessage.fetch()
  if(!oldMessage.content) return
  if(!newMessage.content) return
  let LoggerSettingDB = await LoggerSetting.findOne({guild_id: newMessage.guild?.id})
  if(!LoggerSettingDB) return
  if(!LoggerSettingDB.useing.editMessage) return
  let logChannel = newMessage.guild?.channels.cache.get(LoggerSettingDB.guild_channel_id) as TextChannel
  if(!logChannel) return
  let oldContent = new String(oldMessage.content)
  let newContent = new String(newMessage.content)
  if(oldContent !== newContent) {
    if (oldContent.length > 500) {
      let oldContentLength = oldMessage.content.length - 500
      oldContent = oldContent.slice(0, 500) + `... +${oldContentLength}`
    }
    if (newContent.length > 500) {
      let newContentLength = newMessage.content.length - 500
      newContent = newContent.slice(0, 500) + `... +${newContentLength}`
    }
    let embed = new Embed(client, 'warn')
      .setTitle('메시지 수정')
      .addField('채널', `<#${newMessage.channel.id}>` + '(`' + newMessage.channel.id + '`)')
      .addField('메시지', `[메시지](${newMessage.url})`)
      .addField('수정전', `${oldContent ? oldContent : '없음'}`)
      .addField('수정후', `${newContent ? newContent : '없음'}`)
 
    return await logChannel.send({embeds: [embed]})
  }
})
