const { GuildChannel, DMChannel } = require('discord.js') // eslint-disable-line no-unused-vars
const { LoggerSetting } = require('../schemas/LogSettingSchema')
const LogEmbed = require('../utils/LogEmbed')


module.exports = {
  name: 'channelUpdate',
  /**
   * 
   * @param {import('../structures/BotClient')} client 
   * @param {GuildChannel|DMChannel} oldChannel 
   * @param {GuildChannel|DMChannel} newChannel
   */
  async execute(client, oldChannel, newChannel) {
    let LoggerSettingDB = await LoggerSetting.findOne({guild_id: newChannel.guild.id})
    if(!LoggerSettingDB) return
    if(!LoggerSettingDB.useing.editChannel) return
    let logChannel = newChannel.guild.channels.cache.get(LoggerSettingDB.guild_channel_id)
    if(!logChannel) return
    let embed = new LogEmbed(client, 'warn')
      .setDescription('채널 수정')
      .addFields({
        name: '채널',
        value: `<#${newChannel.id}>` + '(`' + newChannel.id + '`)'
      })
    if (oldChannel.name != newChannel.name) embed.addField('이름 수정', '`' + oldChannel.name + '`' + ' -> ' + '`' + newChannel.name + '`')
    if (oldChannel.rawPosition != newChannel.rawPosition) embed.addField('위치 변경', '`' + oldChannel.rawPosition + '`' + ' -> ' + '`' + newChannel.rawPosition + '`')
    if (oldChannel.parent != newChannel.parent) embed.addField('카테고리 변경', '`' + (oldChannel.parent ? oldChannel.parent.name : '없음') + '`' + ' -> ' + '`' + (newChannel.parent ? newChannel.parent.name : '없음') + '`')
    return await logChannel.send({embeds: [embed]})
  }
}
