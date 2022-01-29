const { VoiceState } = require('discord.js') // eslint-disable-line no-unused-vars
const { LoggerSetting } = require('../schemas/LogSettingSchema')
const Embed = require('../utils/LogEmbed')

module.exports = {
  name: 'voiceStateUpdate',
  /**
   * @param {import('../structures/BotClient')} client 
   * @param {VoiceState} oldState
   * @param {VoiceState} newState
   */
  async execute(client, oldState, newState) {
    const { guild, member, channel } = newState
    if(!guild) return
    let LoggerSettingDB = await LoggerSetting.findOne({guild_id: guild.id})
    if(!LoggerSettingDB) return
    let logChannel = guild.channels.cache.get(LoggerSettingDB.guild_channel_id)
    if(!logChannel) return
    let embed = new Embed(client, 'warn')
      .addField('유저', `<@${member.id}>` + '(`' + member.id + '`)', true)
    let updated = false
    if(!channel) {
      if(!LoggerSettingDB.useing.leaveVoiceChannel) return
      embed.setTitle('음성채널 퇴장')
      embed.addField('채널', oldState.channel.id ? `<#${oldState.channel.id}>` + '(`' + oldState.channel.id + '`)' : '없음', true)
      embed.setColor('RED')
      updated = true
    }
    if(!oldState.channel) {
      if(!LoggerSettingDB.useing.joinVoiceChannel) return
      embed.setTitle('음성채널 입장')
      embed.addField('채널', channel.id ? `<#${channel.id}>` + '(`' + channel.id + '`)' : '없음', true)
      embed.setColor('GREEN')
      updated = true
    }
    if(updated) return await logChannel.send({embeds: [embed]})
  }
}