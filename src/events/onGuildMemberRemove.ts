import { TextChannel, GuildMember } from 'discord.js'
import LoggerSetting from 'src/schemas/LogSettingSchema'
import WelcomeSetting from 'src/schemas/WelcomeSettingSchema'
import BotClient from 'src/structures/BotClient'
import Embed from 'src/utils/Embed'
import { Event } from '../structures/Event'
export default new Event('guildMemberRemove', async (client, member) => {
  if(member.partial) member = await member.fetch()
  GreetingEvent(client, member)
  LoggerEvent(client, member)
})

const GreetingEvent = async(client: BotClient, member: GuildMember) => {
  const WelcomeSettingDB = await WelcomeSetting.findOne({guild_id: member.guild.id})
  if(!WelcomeSettingDB) return
  if(!WelcomeSettingDB.outting_message || WelcomeSettingDB.outting_message == '') return
  const WelcomeChannel = member.guild.channels.cache.get(WelcomeSettingDB.channel_id) as TextChannel
  if(!WelcomeChannel) return
  const embed = new Embed(client, 'warn')
  embed.setAuthor(member.user.username, member.user.displayAvatarURL())
  embed.setDescription(String(WelcomeSettingDB.outting_message).replaceAll('${username}', member.user.username).replaceAll('${discriminator}', member.user.discriminator).replaceAll('${servername}', member.guild.name))
  return await WelcomeChannel.send({embeds: [embed]})
}

const LoggerEvent = async(client: BotClient, member: GuildMember) => {
  const LoggerSettingDB = await LoggerSetting.findOne({guild_id: member.guild.id})
  if(!LoggerSettingDB) return
  if(!LoggerSettingDB.useing.memberLeft) return
  const logChannel = member.guild.channels.cache.get(LoggerSettingDB.guild_channel_id) as TextChannel
  if(!logChannel) return
  const embed = new Embed(client, 'error')
    .setTitle('멤버 퇴장')
    .setAuthor(member.user.username, member.user.displayAvatarURL())
    .addFields({
      name: '유저',
      value: `<@${member.user.id}>` + '(`' + member.user.id + '`)'
    })
  return await logChannel.send({embeds: [embed]})
}