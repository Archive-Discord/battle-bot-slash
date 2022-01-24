const { GuildMember } = require('discord.js')
const { LoggerSetting } = require('../schemas/LogSettingSchema')
const LogEmbed = require('../utils/LogEmbed')


module.exports = {
  name: 'guildMemberAdd',
  /**
   * 
   * @param {import('../structures/BotClient')} client 
   * @param {GuildMember} member 
   */
  async execute(client, member) {
    let LoggerSettingDB = await LoggerSetting.findOne({guild_id: member.guild.id})
    if(!LoggerSettingDB) return
    if(!LoggerSettingDB.useing.memberJoin) return
    let logChannel = member.guild.channels.cache.get(LoggerSettingDB.guild_channel_id)
    if(!logChannel) return
    let embed = new LogEmbed(client, 'success')
        .setDescription('멤버 추가')
        .setAuthor(member.user.username, member.user.displayAvatarURL())
        .addFields({
            name: "유저",
            value: `<@${member.user.id}>` + "(`" + member.user.id + "`)"
        })
    return await logChannel.send({embeds: [embed]})
  }
}
