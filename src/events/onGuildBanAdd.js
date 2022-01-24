const { GuildBan } = require('discord.js')
const { LoggerSetting } = require('../schemas/LogSettingSchema')
const LogEmbed = require('../utils/LogEmbed')


module.exports = {
  name: 'guildBanAdd',
  /**
   * 
   * @param {import('../structures/BotClient')} client 
   * @param {GuildBan} ban 
   */
  async execute(client, ban) {
    let LoggerSettingDB = await LoggerSetting.findOne({guild_id: ban.guild.id})
    if(!LoggerSettingDB) return
    if(!LoggerSettingDB.useing.memberBan) return
    let logChannel = ban.guild.channels.cache.get(LoggerSettingDB.guild_channel_id)
    if(!logChannel) return
    let embed = new LogEmbed(client, 'error')
        .setDescription('멤버 차단')
        .setAuthor(ban.user.username, ban.user.displayAvatarURL())
        .addFields({
            name: "유저",
            value: `<@${ban.user.id}>` + "(`" + ban.user.id + "`)"
        }, {
            name: "사유",
            value: ban.reason ? ban.reason : "없음"
        })
    return await logChannel.send({embeds: [embed]})
  }
}
