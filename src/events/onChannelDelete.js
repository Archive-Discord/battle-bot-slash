const { GuildChannel } = require('discord.js')
const { LoggerSetting } = require('../schemas/LogSettingSchema')
const LogEmbed = require('../utils/LogEmbed')


module.exports = {
  name: 'channelDelete',
  /**
   * 
   * @param {import('../structures/BotClient')} client 
   * @param {GuildChannel} channel 
   */
  async execute(client, channel) {
    let LoggerSettingDB = await LoggerSetting.findOne({guild_id: channel.guild.id})
    if(!LoggerSettingDB) return
    if(!LoggerSettingDB.useing.deleteChannel) return
    let logChannel = channel.guild.channels.cache.get(LoggerSettingDB.guild_channel_id)
    if(!logChannel) return
    let embed = new LogEmbed(client, 'error')
        .setDescription('채널 삭제')
        .addFields({
            name: "채널",
            value: `${channel.name}` + "(`" + channel.id + "`)"
        }, {
            name: "카테고리",
            value: channel.parent.name
        })
    return await logChannel.send({embeds: [embed]})
  }
}
