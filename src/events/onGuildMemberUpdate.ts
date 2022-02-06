import { DiscordAPIError, GuildMember, TextChannel, User } from 'discord.js'
import CommandManager from 'src/managers/CommandManager'
import ErrorManager from 'src/managers/ErrorManager'
import Automod from 'src/schemas/autoModSchema'
import Blacklist from 'src/schemas/blacklistSchemas'
import LoggerSetting from 'src/schemas/LogSettingSchema'
import WelcomeSetting from 'src/schemas/WelcomeSettingSchema'
import BotClient from 'src/structures/BotClient'
import Embed from 'src/utils/Embed'
import { Event } from '../structures/Event'
import Logger from "../utils/Logger"
export default new Event('guildMemberUpdate', async (client, oldMember, newMember) => {
  let LoggerSettingDB = await LoggerSetting.findOne({guild_id: newMember.guild.id})
  if(!LoggerSettingDB) return
  if(!LoggerSettingDB.useing.memberUpdate) return
  let logChannel = newMember.guild.channels.cache.get(LoggerSettingDB.guild_channel_id) as TextChannel
  if(!logChannel) return
  let update = false
  let embed = new Embed(client, 'warn')
  .setTitle('멤버 수정')
  .addField('유저', `<@${newMember.user.id}>` + '(`' + newMember.user.id + '`)')
  if(oldMember.nickname !== newMember.nickname) {
    let fetchedLogs = await newMember.guild.fetchAuditLogs({
      limit: 1,
      type: 'MEMBER_UPDATE',
    })
    let deletionLog = fetchedLogs.entries.first()
    if(deletionLog) {
      let executor = deletionLog.executor as User
      let target = deletionLog.target as User
      if(target.id === newMember.id && executor.id !== newMember.id) embed.addField('수정유저', `<@${executor.id}>` + '(`' + executor.id + '`)')
    }
    embed.addField('닉네임 수정', '`' + (oldMember.nickname ? oldMember.nickname : oldMember.user.username) + '`' + ' ->' + '`' + (newMember.nickname ? newMember.nickname : newMember.user.username) + '`')
    update = true
  }
  if(!oldMember.premiumSince && newMember.premiumSince) {
    embed.addField('서버 부스트', `<@${newMember.user.id}>` + '(`' + newMember.user.id + '`)' + ' 님이 서버를 부스트 했습니다')
    update = true
  }
  if(oldMember.roles.cache.size !== newMember.roles.cache.size) {
    let fetchedLogs = await newMember.guild.fetchAuditLogs({
      limit: 1,
      type: 'MEMBER_ROLE_UPDATE',
    })
    let deletionLog = fetchedLogs.entries.first()
    if(deletionLog) {
      let executor = deletionLog.executor as User
      let target = deletionLog.target as User
      if(target.id === newMember.id) embed.addField('수정유저', `<@${executor.id}>` + '(`' + executor.id + '`)')
    }
    if(oldMember.roles.cache.size > newMember.roles.cache.size) {
      oldMember.roles.cache.forEach(role => {
        if (!newMember.roles.cache.has(role.id)) {
          embed.addField('역할 삭제', `<@&${role.id}>` + '(`' + role.id + '`)')
          update = true
        }
      })
    } else if (oldMember.roles.cache.size < newMember.roles.cache.size) {
      newMember.roles.cache.forEach(role => {
        if (!oldMember.roles.cache.has(role.id)) {
          embed.addField('역할 추가', `<@&${role.id}>` + '(`' + role.id + '`)')
          update = true
        }
      })
    }
  }
  if(update) return await logChannel.send({embeds: [embed]})
})
