import { Event } from '../structures/Event'
import LoggerSetting from 'src/schemas/LogSettingSchema'
import Embed from 'src/utils/Embed'
import { TextChannel } from 'discord.js'

export default new Event('messageUpdate', async (client, oldMessage, newMessage) => {
  if(!newMessage.guild) return
  if(oldMessage.partial) oldMessage = await oldMessage.fetch()
  if(newMessage.partial) newMessage = await newMessage.fetch()
  if(!oldMessage.content) return
  if(!newMessage.content) return
  const LoggerSettingDB = await LoggerSetting.findOne({guild_id: newMessage.guild?.id})
  if(!LoggerSettingDB) return
  if(!LoggerSettingDB.useing.editMessage) return
  const logChannel = newMessage.guild?.channels.cache.get(LoggerSettingDB.guild_channel_id) as TextChannel
  if(!logChannel) return
  let oldContent = new String(oldMessage.content)
  let newContent = new String(newMessage.content)
  if(oldContent !== newContent) {
    if (oldContent.length > 500) {
      const oldContentLength = oldMessage.content.length - 500
      oldContent = oldContent.slice(0, 500) + `... +${oldContentLength}`
    }
    if (newContent.length > 500) {
      const newContentLength = newMessage.content.length - 500
      newContent = newContent.slice(0, 500) + `... +${newContentLength}`
    }
    const embed = new Embed(client, 'warn')
      .setTitle('메시지 수정')
      .addField('채널', `<#${newMessage.channel.id}>` + '(`' + newMessage.channel.id + '`)')
      .addField('메시지', `[메시지](${newMessage.url})`)
      .addField('수정전', `${oldContent ? oldContent : '없음'}`)
      .addField('수정후', `${newContent ? newContent : '없음'}`)
 
    return await logChannel.send({embeds: [embed]})
  }
})
