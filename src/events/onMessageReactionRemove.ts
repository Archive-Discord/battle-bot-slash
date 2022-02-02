import BotClient from '@client';
import { MessageAttachment, Collection, Message, MessageReaction, User, TextChannel } from 'discord.js'
import LoggerSetting from '../schemas/LogSettingSchema'
import Embed from '../utils/LogEmbed'

export default {
  name: 'messageReactionRemove',
  /**
   * @param {import('../structures/BotClient')} client 
   * @param {MessageReaction} messageReaction
   * @param {User} user
   */
  async execute(client: BotClient, messageReaction: MessageReaction, user: User) {
    let { guild } = messageReaction.message;
    if (user.bot) return
    if (!guild) return
    let LoggerSettingDB = await LoggerSetting.findOne({ guild_id: messageReaction.message.guild?.id })
    if (!LoggerSettingDB?.useing.memberBan) return

    let logChannel = messageReaction.message.guild?.channels.cache.get(LoggerSettingDB.guild_channel_id) as TextChannel
    if (!logChannel) return

    let embed = new Embed(client, 'error')
      .setTitle('반응 삭제')
      .addField("채널", `<#${messageReaction.message.channel.id}>` + "(`" + messageReaction.message.channel.id + "`)")
      .addField("메시지", `[메시지](${messageReaction.message.url})`)
      .addField("유저", `<@${user.id}>` + "(`" + user.id + "`)")
      .addField("반응 이모지", messageReaction.emoji.toString())

    return await logChannel.send({ embeds: [embed] })
  }
}