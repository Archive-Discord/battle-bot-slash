const { GuildScheduledEvent } = require('discord.js') // eslint-disable-line no-unused-vars
const { LoggerSetting } = require('../schemas/LogSettingSchema')
const LogEmbed = require('../utils/LogEmbed')


module.exports = {
  name: 'guildScheduledEventDelete',
  /**
   * 
   * @param {import('../structures/BotClient')} client 
   * @param {GuildScheduledEvent} guildScheduledEvent 
   */
  async execute(client, guildScheduledEvent) {
    let LoggerSettingDB = await LoggerSetting.findOne({guild_id: guildScheduledEvent.guild.id})
    if(!LoggerSettingDB) return
    if(!LoggerSettingDB.useing.eventDelete) return
    let logChannel = guildScheduledEvent.guild.channels.cache.get(LoggerSettingDB.guild_channel_id)
    if(!logChannel) return
    let embed = new LogEmbed(client, 'error')
      .setDescription('이벤트 삭제')
      .addFields({
        name: '이름',
        value: guildScheduledEvent.name
      },
      {
        name: '생성자',
        value: `<@${guildScheduledEvent.creator.id}>` + '(`' + guildScheduledEvent.creator.id + '`)'
      },
      {
        name: '장소',
        value: guildScheduledEvent.channel ? `<#${guildScheduledEvent.channel.id}>` + '(`' + guildScheduledEvent.channel.id + '`)' : guildScheduledEvent.entityMetadata.location
      })
    return await logChannel.send({embeds: [embed]})
  }
}
