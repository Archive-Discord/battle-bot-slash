const { GuildMember } = require('discord.js') // eslint-disable-line no-unused-vars
const { WelcomeSetting } = require('../schemas/WelcomeSettingSchema')
const Embed = require('../utils/Embed')


module.exports = {
  name: 'guildMemberRemove',
  /**
   * 
   * @param {import('../structures/BotClient')} client 
   * @param {GuildMember} member 
   */
  async execute(client, member) {
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
}
