<<<<<<< HEAD:src/events/onGuildScheduledEventCreate.ts
import { GuildMember, GuildScheduledEvent } from 'discord.js'
import { value } from 'mongoose/lib/options/propertyOptions'
import { LoggerSetting } from'../schemas/LogSettingSchema'
import DateFormatting from'../utils/DateFormatting'
import LogEmbed from'../utils/LogEmbed'
import { fileURLToPath } from 'url'
import BotClient from '@client'


export default {
  name: 'guildScheduledEventDelete',
=======
const { GuildScheduledEvent } = require('discord.js') // eslint-disable-line no-unused-vars
const { LoggerSetting } = require('../schemas/LogSettingSchema')
const DateFormatting = require('../utils/DateFormatting')
const LogEmbed = require('../utils/LogEmbed')


module.exports = {
  name: 'guildScheduledEventCreate',
>>>>>>> origin/master:src/events/onGuildScheduledEventCreate.js
  /**
   * 
   * @param {import('../structures/BotClient')} client 
   * @param {GuildScheduledEvent} guildScheduledEvent 
   */
  async execute(client: BotClient, guildScheduledEvent: GuildScheduledEvent<'CANCELED'>) {
    
    let LoggerSettingDB = await LoggerSetting.findOne({guild_id: guildScheduledEvent.guild.id})
    if(!LoggerSettingDB) return
    if(!LoggerSettingDB.useing.eventCreate) return
    let logChannel = guildScheduledEvent.guild.channels.cache.get(LoggerSettingDB.guild_channel_id)
    if(!logChannel) return
    let embed = new LogEmbed(client, 'success')
      .setDescription('이벤트 추가')
      .addFields({
        name: '이름',
        value: guildScheduledEvent.name
      },
      {
        name: '설명',
        value: guildScheduledEvent.description ? guildScheduledEvent.description : '없음'
      },
      {   
        name: '시작일',
        value: guildScheduledEvent.scheduledStartAt ? DateFormatting.relative(guildScheduledEvent.scheduledStartTimestamp) : '없음'
      },
      {   
        name: '종료일',
        value: guildScheduledEvent.scheduledEndAt ? DateFormatting.relative(guildScheduledEvent.scheduledEndTimestamp) : '없음'
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
