import Discord ,{ GuildAuditLogs, GuildAuditLogsEntry, GuildChannel, TextChannel, User } from 'discord.js'
import CommandManager from 'src/managers/CommandManager'
import ErrorManager from 'src/managers/ErrorManager'
import LoggerSetting from 'src/schemas/LogSettingSchema'
import Embed from 'src/utils/Embed'
import Logger from 'src/utils/Logger'
import { Event } from '../structures/Event'
const log = new Logger('GuildCreateEvent')
export default new Event('guildUpdate', async (client, oldGuild, newGuild) => {
  let LoggerSettingDB = await LoggerSetting.findOne({guild_id: newGuild.id})
  if(!LoggerSettingDB) return
  if(!LoggerSettingDB.useing.serverSetting) return
  let logChannel = newGuild.channels.cache.get(LoggerSettingDB.guild_channel_id) as TextChannel
  if(!logChannel) return
  let update = false
  let embed = new Embed(client, 'warn')
    .setTitle('서버 수정')
  if(oldGuild.name != newGuild.name) {
    embed.addField('이름 수정', '`' + oldGuild.name + '`' + ' -> ' + '`' + newGuild.name + '`')
    update = true
  } 
  if(oldGuild.premiumTier !== newGuild.premiumTier) {
    embed.addField(`부스트 ${oldGuild.premiumTier < newGuild.premiumTier ? '추가됨' : '차감됨'}`, '`' + oldGuild.premiumTier + '`' + ' -> ' + '`' + newGuild.premiumTier + '`')
    update = true
  } 
  if (!oldGuild.banner && newGuild.banner) {
    embed.addField('배너 수정', '`' + oldGuild.banner + '`' + ' -> ' + '`' + newGuild.banner + '`')
    update = true
  } 
  if (!oldGuild.afkChannel && newGuild.afkChannel) {
    embed.addField('잠수 채널 수정', (oldGuild.afkChannelId ? `<#${oldGuild.afkChannelId}>` + '(`' + oldGuild.afkChannelId + '`)' : '`없음`') + ' -> ' + (newGuild.afkChannelId? `<#${newGuild.afkChannelId}>` + '(`' + newGuild.afkChannelId + '`)' : '`없음`'))
    update = true
  } 
  if (!oldGuild.vanityURLCode && newGuild.vanityURLCode ) {
    embed.addField('초대 링크 수정', (oldGuild.vanityURLCode ? oldGuild.vanityURLCode : '`없음`') + ' -> ' + (newGuild.vanityURLCode ? newGuild.vanityURLCode : '`없음`') )
    update = true
  }
  if(oldGuild.afkTimeout !== newGuild.afkTimeout) {
    embed.addField('잠수 시간 수정', '`' + oldGuild.afkTimeout/60 +'분' + '`' + ' -> ' + '`' + newGuild.afkTimeout/60 +'분' + '`')
    update = true
  }
  if(oldGuild.ownerId !== newGuild.ownerId) {
    embed.addField('서버 주인 변경', `<@${oldGuild.ownerId}>` + '(`' + oldGuild.ownerId + '`)' + ' -> ' + `<@${newGuild.ownerId}>` + '(`' + newGuild.ownerId + '`)')
    update = true
  }
  if(oldGuild.systemChannelId !== newGuild.systemChannelId) {
    embed.addField('시스템 채널 변경', `<#${oldGuild.systemChannelId}>` + '(`' + oldGuild.systemChannelId + '`)' + ' -> ' + `<#${newGuild.systemChannelId}>` + '(`' + newGuild.systemChannelId + '`)')
    update = true
  }
  if(update) return await logChannel.send({embeds: [embed]})
})
