import { GuildMember, GuildScheduledEvent } from 'discord.js'
import { value } from 'mongoose/lib/options/propertyOptions'
import { LoggerSetting } from'../schemas/LogSettingSchema'
import DateFormatting from'../utils/DateFormatting'
import LogEmbed from'../utils/LogEmbed'
import { fileURLToPath } from 'url'
import BotClient from '@client'


export default {
  name: 'guildScheduledEventDelete',
  /**
   * 
   * @param {import('../structures/BotClient')} client 
   * @param {GuildScheduledEvent} guildScheduledEvent 
   */
  async execute(client: BotClient, guildScheduledEvent: GuildScheduledEvent<'CANCELED'>) {
    
    let LoggerSettingDB = await LoggerSetting.findOne({guild_id: guildScheduledEvent.guild.id})
    if(!LoggerSettingDB) return
    if(!LoggerSettingDB.useing.memberJoin) return
    let logChannel = guildScheduledEvent.guild.channels.cache.get(LoggerSettingDB.guild_channel_id)
    if(!logChannel) return
    let embed = new LogEmbed(client, 'error')
        .setDescription('이벤트 삭제')
        .addFields({
            name: "이름",
            value: guildScheduledEvent.name
        },
        {
            name: "생성자",
            value: `<@${guildScheduledEvent.creator.id}>` + "(`" + guildScheduledEvent.creator.id + "`)"
        },
        {
            name: "장소",
            value: guildScheduledEvent.channel ? `<#${guildScheduledEvent.channel.id}>` + "(`" + guildScheduledEvent.channel.id + "`)" : guildScheduledEvent.entityMetadata.location
        })
    return await logChannel.send({embeds: [embed]})
  }
}
