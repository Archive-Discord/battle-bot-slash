const { Invite } = require('discord.js') // eslint-disable-line no-unused-vars
const { LoggerSetting } = require('../schemas/LogSettingSchema')
const LogEmbed = require('../utils/LogEmbed')

module.exports = {
  name: 'inviteDelete',
  /**
   * 
   * @param {import('../structures/BotClient')} client 
   * @param {Invite} invite
   */
  async execute(client, invite) {
    let LoggerSettingDB = await LoggerSetting.findOne({guild_id: invite.guild.id})
    if(!LoggerSettingDB) return
    if(!LoggerSettingDB.useing.inviteGuild) return
    let logChannel = invite.guild.channels.cache.get(LoggerSettingDB.guild_channel_id)
    if(!logChannel) return
    let embed = new LogEmbed(client, 'error')
      .setDescription('초대코드 삭제')
    embed.addField('초대코드', invite.code)
    return await logChannel.send({embeds: [embed]})
  }
}
