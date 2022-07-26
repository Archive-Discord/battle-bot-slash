import { Event } from '../structures/Event'
import LoggerSetting from '../schemas/LogSettingSchema'
import Embed from '../utils/Embed'
import { TextChannel } from 'discord.js'

export default new Event(
  'messageReactionRemoveAll',
  async (client, message) => {
    const { guild } = message
    if (!guild) return
    if (message.partial) await message.fetch()

    const LoggerSettingDB = await LoggerSetting.findOne({ guild_id: guild.id })
    if (!LoggerSettingDB) return
    if (!LoggerSettingDB.useing.reactMessage) return

    const logChannel = guild.channels.cache.get(
      LoggerSettingDB.guild_channel_id
    ) as TextChannel
    if (!logChannel) return
    const embed = new Embed(client, 'error')
      .setTitle('모든 반응 삭제')
      .addFields(
        {
          name: '채널',
          value: `<#${message.channel.id}>` + '(`' + message.channel.id + '`)'
        },
        { name: '메시지', value: `[메시지](${message.url})` }
      )

    return await logChannel.send({ embeds: [embed] })
  }
)
