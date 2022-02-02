const { GuildMember } = require('discord.js') // eslint-disable-line no-unused-vars
const { LoggerSetting } = require('../schemas/LogSettingSchema')
const { WelcomeSetting } = require('../schemas/WelcomeSettingSchema')
const Embed = require('../utils/Embed')
const LogEmbed = require('../utils/LogEmbed')


module.exports = {
  name: 'guildMemberRemove',
  /**
   * 
   * @param {import('../structures/BotClient')} client 
   * @param {GuildMember} member 
   */
  async execute(client, member) {
    LoggerEvent(client, member)
    GreetingEvent(client, member)
  }
}


/**
 * 
 * @param {import('../structures/BotClient')} client 
 * @param {GuildMember} member 
 */
async function GreetingEvent(client, member) {
  let WelcomeSettingDB = await WelcomeSetting.findOne({guild_id: member.guild.id})
  if(!WelcomeSettingDB) return
  if(!WelcomeSettingDB.outting_message || WelcomeSettingDB.outting_message == '') return
  let WelcomeChannel = member.guild.channels.cache.get(WelcomeSettingDB.channel_id)
  if(!WelcomeChannel) return
  let embed = new Embed(client, 'warn')
  embed.setAuthor(member.user.username, member.user.displayAvatarURL())
  embed.setDescription(String(WelcomeSettingDB.outting_message).replaceAll('${username}', member.user.username).replaceAll('${discriminator}', member.user.discriminator).replaceAll('${servername}', member.guild.name))
  return await WelcomeChannel.send({embeds: [embed]})
}

/**
 * 
 * @param {import('../structures/BotClient')} client 
 * @param {GuildMember} member 
 */
async function LoggerEvent(client, member) {
  let LoggerSettingDB = await LoggerSetting.findOne({guild_id: member.guild.id})
  if(!LoggerSettingDB) return
  if(!LoggerSettingDB.useing.memberLeft) return
  let logChannel = member.guild.channels.cache.get(LoggerSettingDB.guild_channel_id)
  if(!logChannel) return
  let embed = new LogEmbed(client, 'error')
    .setDescription('멤버 퇴장')
    .setAuthor(member.user.username, member.user.displayAvatarURL())
    .addFields({
      name: '유저',
      value: `<@${member.user.id}>` + '(`' + member.user.id + '`)'
    })
  return await logChannel.send({embeds: [embed]})
}