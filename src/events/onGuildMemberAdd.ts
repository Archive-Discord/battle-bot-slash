import { DiscordAPIError, GuildMember, TextChannel } from 'discord.js'
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
const log = new Logger('GuildMemberAddEvent')
export default new Event('guildMemberAdd', async (client, member) => {
  WelecomEvent(client, member)
  WelecomLogEvent(client, member)
  AutoModEvent(client, member)
  AutoModCreateAtEvent(client, member)
  AutoModAutoRoleEvent(client, member)
})


const WelecomEvent = async(client: BotClient, member: GuildMember) => {
  let WelcomeSettingDB = await WelcomeSetting.findOne({guild_id: member.guild.id})
  if(!WelcomeSettingDB) return
  if(!WelcomeSettingDB.welcome_message || WelcomeSettingDB.welcome_message == '') return
  let WelcomeChannel = member.guild.channels.cache.get(WelcomeSettingDB.channel_id) as TextChannel
  if(!WelcomeChannel) return
  let embed = new Embed(client, 'success')
  embed.setAuthor(member.user.username, member.user.displayAvatarURL())
  embed.setDescription(String(WelcomeSettingDB.welcome_message).replaceAll('${username}', member.user.username).replaceAll('${discriminator}', member.user.discriminator).replaceAll('${servername}', member.guild.name))
  return await WelcomeChannel.send({embeds: [embed]})
}

const WelecomLogEvent = async (client: BotClient, member: GuildMember) => {
  let LoggerSettingDB = await LoggerSetting.findOne({guild_id: member.guild.id})
  if(!LoggerSettingDB) return
  if(!LoggerSettingDB.useing.memberJoin) return
  let logChannel = member.guild.channels.cache.get(LoggerSettingDB.guild_channel_id) as TextChannel
  if(!logChannel) return
  let embed = new Embed(client, 'success')
    .setTitle('멤버 추가')
    .setAuthor(member.user.username, member.user.displayAvatarURL())
    .addFields({
      name: '유저',
      value: `<@${member.user.id}>` + '(`' + member.user.id + '`)'
    })
  return await logChannel.send({embeds: [embed]})
}

const AutoModEvent = async (client: BotClient, member: GuildMember) => {
  let automodDB = await Automod.findOne({guild_id: member.guild.id})
  if(!automodDB) return
  if(automodDB.useing.useBlackList) {
    let banlist =  await Blacklist.find({status: 'blocked'})
    let isUser = banlist.some(user => user.user_id === member.id)
    if(isUser) {
      let user =  await Blacklist.findOne({user_id: member.id})
      return await member.ban({reason: `[배틀이 자동차단] ${user.reason}`})
    } else {
      return
    }
  } else {
    return
  }
}

const AutoModCreateAtEvent = async (client: BotClient, member: GuildMember) => {
  let automodDB = await Automod.findOne({guild_id: member.guild.id})
  if(!automodDB) return
  if(!automodDB.useing.useCreateAt || automodDB.useing.useCreateAt === 0) return
  let now = new Date()
  let elapsedDate = Math.round((Number(now) - Number(member.user.createdAt)) / 1000 / 60 / 60 / 24)
  if(elapsedDate < automodDB.useing.useCreateAt) {
    try {
      let embed = new Embed(client, 'error')
        .setTitle('배틀이 자동 시스템')
        .setDescription(`해당 서버는 계정 생성후 ${automodDB.useing.useCreateAt}일이 지나야 입장이 가능합니다`)
      await member.send({embeds: [embed]})
    } catch(e: any) {
      log.error(e)
    }
    return member.kick()
  } else {
    return
  }
}

const AutoModAutoRoleEvent = async (client: BotClient, member: GuildMember) => {
  let automodDB = await Automod.findOne({guild_id: member.guild.id})
  if(!automodDB) return
  if(!automodDB.useing.useAutoRole) return
  let role = member.guild.roles.cache.get(automodDB.useing.autoRoleId)
  if(!role) return
  try {
    return member.roles.add(role)
  } catch(e) {
    return
  }
}