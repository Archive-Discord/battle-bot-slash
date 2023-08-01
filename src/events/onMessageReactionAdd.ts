import { Event } from '../structures/Event';
import LoggerSetting from '../schemas/LogSettingSchema';
import Embed from '../utils/Embed';
import { TextChannel } from 'discord.js';
import { checkLogFlag, LogFlags, SOCKET_ACTIONS } from '../utils/Utils';
import custombotSchema from '../schemas/custombotSchema';

export default new Event('messageReactionAdd', async (client, messageReaction, user) => {
  const { guild } = messageReaction.message;

  if (user.bot) return;
  if (!guild) return;
  if (messageReaction.partial) messageReaction = await messageReaction.fetch();
  if (messageReaction.message.partial)
    messageReaction.message = await messageReaction.message.fetch();
  const LoggerSettingDB = await LoggerSetting.findOne({
    guild_id: messageReaction.message.guild?.id,
  });
  if (!LoggerSettingDB) return;
  if (!checkLogFlag(LoggerSettingDB.loggerFlags, LogFlags.MESSAGE_REACTION_ADD)) return;
  const logChannel = messageReaction.message.guild?.channels.cache.get(
    LoggerSettingDB.guild_channel_id,
  ) as TextChannel;
  if (!logChannel) return;
  const embed = new Embed(client, 'success').setTitle('반응 추가').addFields(
    { name: '유저', value: `> <@${user.id}>` + '(`' + user.id + '`)' },
    {
      name: '채널',
      value:
        `> <#${messageReaction.message.channel.id}>` +
        '(`' +
        messageReaction.message.channel.id +
        '`)',
    },
    { name: '메시지', value: `[메시지](${messageReaction.message.url})` },
    {
      name: '반응 이모지',
      value: messageReaction.emoji.toString(),
    },
  );

  const customBot = await custombotSchema.findOne({
    guildId: messageReaction.message.guild?.id,
    useage: true,
  });

  if (customBot) {
    client.socket.emit(SOCKET_ACTIONS.SEND_LOG_MESSAGE, {
      guildId: messageReaction.message.guild?.id,
      channelId: logChannel.id,
      embed: embed.toJSON(),
    })
    return
  } else {
    return await logChannel.send({ embeds: [embed] });
  }
});
