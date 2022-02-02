const { GuildMember } = require('discord.js') // eslint-disable-line no-unused-vars
const { LoggerSetting } = require('../schemas/LogSettingSchema')
const { WelcomeSetting } = require('../schemas/WelcomeSettingSchema')
const { Automod } = require('../schemas/automodSchema')
const { Blacklist } = require('../schemas/blacklistSchemas')
const LogEmbed = require('../utils/LogEmbed')
const Embed = require('../utils/Embed')
const Logger = require("../utils/Logger")
const log = new Logger('GuildMemberAdd')

module.exports = {
  name: 'guildMemberAdd',
  /**
   * 
   * @param {import('../structures/BotClient')} client 
   * @param {GuildMember} member 
   */
  async execute(client, member) {
    WelecomEvent(client, member)
    WelecomLogEvent(client, member)
    AutoModEvent(client, member)
    AutoModCreateAtEvent(client, member)
  }
}

/**
 * 
 * @param {import('../structures/BotClient')} client 
 * @param {GuildMember} member 
 */
async function WelecomEvent(client, member) {
  let WelcomeSettingDB = await WelcomeSetting.findOne({guild_id: member.guild.id})
  if(!WelcomeSettingDB) return
  if(!WelcomeSettingDB.welcome_message || WelcomeSettingDB.welcome_message == '') return
  let WelcomeChannel = member.guild.channels.cache.get(WelcomeSettingDB.channel_id)
  if(!WelcomeChannel) return
  let embed = new Embed(client, 'success')
  embed.setAuthor(member.user.username, member.user.displayAvatarURL())
  embed.setDescription(String(WelcomeSettingDB.welcome_message).replaceAll('${username}', member.user.username).replaceAll('${discriminator}', member.user.discriminator).replaceAll('${servername}', member.guild.name))
  return await WelcomeChannel.send({embeds: [embed]})
}

/**
 * 
 * @param {import('../structures/BotClient')} client 
 * @param {GuildMember} member 
 */
async function WelecomLogEvent(client, member) {
  let LoggerSettingDB = await LoggerSetting.findOne({guild_id: member.guild.id})
  if(!LoggerSettingDB) return
  if(!LoggerSettingDB.useing.memberJoin) return
  let logChannel = member.guild.channels.cache.get(LoggerSettingDB.guild_channel_id)
  if(!logChannel) return
  let embed = new LogEmbed(client, 'success')
    .setDescription('멤버 추가')
    .setAuthor(member.user.username, member.user.displayAvatarURL())
    .addFields({
      name: '유저',
      value: `<@${member.user.id}>` + '(`' + member.user.id + '`)'
    })
  return await logChannel.send({embeds: [embed]})
}


/**
 * 
 * @param {import('../structures/BotClient')} client 
 * @param {GuildMember} member 
 */
async function AutoModEvent(client, member) {
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

/**
 * 
 * @param {import('../structures/BotClient')} client 
 * @param {GuildMember} member 
 */
 async function AutoModCreateAtEvent(client, member) {
  let automodDB = await Automod.findOne({guild_id: member.guild.id})
  if(!automodDB) return
  if(!automodDB.useing.useCreateAt || automodDB.useing.useCreateAt === 0) return
  let now = new Date()
  let elapsedDate = Math.round((now - member.user.createdAt) / 1000 / 60 / 60 / 24);
  if(elapsedDate < automodDB.useing.useCreateAt) {
    try {
      let embed = new Embed(client, 'error')
        .setTitle('배틀이 자동 시스템')
        .setDescription(`해당 서버는 계정 생성후 ${automodDB.useing.useCreateAt}일이 지나야 입장이 가능합니다`)
      await member.send({embeds: [embed]})
    } catch(e) {
      log.warn(e)
    }
    return member.kick()
  } else {
    return
  }
}

