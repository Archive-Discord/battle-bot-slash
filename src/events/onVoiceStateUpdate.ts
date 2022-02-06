import { Event } from '../structures/Event'
import CommandManager from '../managers/CommandManager'
import ErrorManager from '../managers/ErrorManager'
import { MessageCommand } from 'src/structures/Command'
import config from 'config'
import LoggerSetting from 'src/schemas/LogSettingSchema'
import Embed from 'src/utils/Embed'
import { GuildChannel, TextChannel, User } from 'discord.js'

export default new Event('voiceStateUpdate', async (client, oldState, newState) => {
  if(!newState.guild) return
  let LoggerSettingDB = await LoggerSetting.findOne({guild_id: newState.guild.id})
  if(!LoggerSettingDB) return
  let logChannel = newState.guild.channels.cache.get(LoggerSettingDB.guild_channel_id) as TextChannel
  if(!logChannel) return
  let embed = new Embed(client, 'warn')
    .addField('유저', `<@${newState.member?.id}>` + '(`' + newState.member?.id + '`)', true)
  let updated = false
  if(!newState.channel) {
    if(!LoggerSettingDB.useing.leaveVoiceChannel) return
    embed.setTitle('음성채널 퇴장')
    embed.addField('채널', oldState.channel?.id ? `<#${oldState.channel.id}>` + '(`' + oldState.channel.id + '`)' : '없음', true)
    embed.setColor('RED')
    updated = true
  }
  if(!oldState.channel) {
    if(!LoggerSettingDB.useing.joinVoiceChannel) return
    embed.setTitle('음성채널 입장')
    embed.addField('채널', newState.channel?.id ? `<#${newState.channel.id}>` + '(`' + newState.channel.id + '`)' : '없음', true)
    embed.setColor('GREEN')
    updated = true
  }
  if(updated) return await logChannel.send({embeds: [embed]})
})
