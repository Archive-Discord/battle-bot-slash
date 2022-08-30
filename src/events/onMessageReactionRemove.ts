import { Event } from '../structures/Event';
import LoggerSetting from '../schemas/LogSettingSchema';
import Embed from '../utils/Embed';
import { TextChannel } from 'discord.js';

export default new Event('messageReactionRemove', async (client, messageReaction, user) => {
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
  if (!LoggerSettingDB.useing.reactMessage) return;
  const logChannel = messageReaction.message.guild?.channels.cache.get(
    LoggerSettingDB.guild_channel_id,
  ) as TextChannel;
  if (!logChannel) return;
  const embed = new Embed(client, 'error').setTitle('반응 삭제').addFields(
    {
      name: '채널',
      value:
        `<#${messageReaction.message.channel.id}>` +
        '(`' +
        messageReaction.message.channel.id +
        '`)',
    },
    { name: '메시지', value: `[메시지](${messageReaction.message.url})` },
    { name: '유저', value: `<@${user.id}>` + '(`' + user.id + '`)' },
    { name: '반응 이모지', value: messageReaction.emoji.toString() },
  );
  return await logChannel.send({ embeds: [embed] });
});
