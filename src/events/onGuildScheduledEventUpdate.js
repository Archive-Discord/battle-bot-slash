const { GuildScheduledEvent } = require('discord.js') // eslint-disable-line no-unused-vars
const { LoggerSetting } = require('../schemas/LogSettingSchema')
const DateFormatting = require('../utils/DateFormatting')
const LogEmbed = require('../utils/LogEmbed')


module.exports = {
  name: 'guildScheduledEventUpdate',
  /**
   * 
   * @param {import('../structures/BotClient')} client 
   * @param {GuildScheduledEvent} oldGuildEvent 
   * @param {GuildScheduledEvent} newGuildEvent
   */
  async execute(client, oldGuildEvent, newGuildEvent) {
    let LoggerSettingDB = await LoggerSetting.findOne({guild_id: newGuildEvent.guild.id})
    if(!LoggerSettingDB) return
    if(!LoggerSettingDB.useing.eventEdit) return
    let logChannel = newGuildEvent.guild.channels.cache.get(LoggerSettingDB.guild_channel_id)
    if(!logChannel) return
    let embed = new LogEmbed(client, 'warn')
      .setDescription('이벤트 수정')
    if (oldGuildEvent.name != newGuildEvent.name) embed.addField('이름 수정', '`' + newGuildEvent.name + '`' + ' -> ' + '`' + oldGuildEvent.name + '`')
    if (oldGuildEvent.description != newGuildEvent.description) embed.addField('설명 수정', '`' + (oldGuildEvent.description ? oldGuildEvent.description : '없음') + '`' + ' -> ' + '`' + (newGuildEvent.description ? newGuildEvent.description : '없음') + '`')
    if (oldGuildEvent.scheduledEndAt != newGuildEvent.scheduledEndAt) embed.addField('종료시간 변경',(newGuildEvent.scheduledEndTimestamp? DateFormatting.relative(oldGuildEvent.scheduledEndTimestamp) : '없음')  + ' -> ' + (newGuildEvent.scheduledEndTimestamp? DateFormatting.relative(newGuildEvent.scheduledEndTimestamp) : '없음' ))
    if (oldGuildEvent.scheduledStartAt != newGuildEvent.scheduledStartAt) embed.addField('시작시간 변경',(newGuildEvent.scheduledStartTimestamp? DateFormatting.relative(oldGuildEvent.scheduledStartTimestamp) : '없음')  + ' -> ' + (newGuildEvent.scheduledStartTimestamp? DateFormatting.relative(newGuildEvent.scheduledStartTimestamp) : '없음' ))
    if (oldGuildEvent.status != newGuildEvent.status) embed.addField('상태 변경', '`' + oldGuildEvent.status + '`' + ' -> ' + '`' + newGuildEvent.status + '`')
    if (oldGuildEvent.entityType != newGuildEvent.entityType) {
      const oldEntityType = (['STAGE_INSTANCE', 'VOICE'].includes(oldGuildEvent.entityType)) ? oldGuildEvent.channel : oldGuildEvent.entityType
      const newEntityType = (['STAGE_INSTANCE', 'VOICE'].includes(newGuildEvent.entityType)) ? newGuildEvent.channel : newGuildEvent.entityType
      embed.addField('장소 변경', `${oldEntityType} -> ${newEntityType}`)
    }

    return await logChannel.send({embeds: [embed]})
  }
}
