import { Event } from '../structures/Event';
import LoggerSetting from '../schemas/LogSettingSchema';
import Embed from '../utils/Embed';
import { TextChannel, VoiceState } from 'discord.js';
import { checkLogFlag, LogFlags, SOCKET_ACTIONS } from '../utils/Utils';
import custombotSchema from '../schemas/custombotSchema';
import BotClient from '../structures/BotClient';
import { MusicSessionStore } from '../utils/redis/music.store';

export default new Event('voiceStateUpdate', async (client, oldState, newState) => {
  voiceLogger(client, oldState, newState);
  musicSessionHandler(client, oldState, newState);
});

const voiceLogger = async (client: BotClient, oldState: VoiceState, newState: VoiceState) => {
  if (!newState.guild) return;
  const LoggerSettingDB = await LoggerSetting.findOne({
    guild_id: newState.guild.id,
  });
  if (!LoggerSettingDB) return;
  const logChannel = newState.guild.channels.cache.get(
    LoggerSettingDB.guild_channel_id,
  ) as TextChannel;
  if (!logChannel) return;
  const embed = new Embed(client, 'warn').addFields({
    name: '유저',
    value: `> <@${newState.member?.id}>` + '(`' + newState.member?.id + '`)',
    inline: true,
  });
  let updated = false;
  if (!newState.channel) {
    if (!checkLogFlag(LoggerSettingDB.loggerFlags, LogFlags.VOICE_CHANNEL_LEAVE)) return; embed
      .setTitle('음성채널 퇴장')
      .addFields({
        name: '채널',
        value: oldState.channel?.id
          ? `> <#${oldState.channel.id}>` + '(`' + oldState.channel.id + '`)'
          : '없음',
      })
      .setType('error');
    updated = true;
  }
  if (!oldState.channel) {
    if (!checkLogFlag(LoggerSettingDB.loggerFlags, LogFlags.VOICE_CHANNEL_JOIN)) return;
    embed
      .setTitle('음성채널 입장')
      .addFields({
        name: '채널',
        value: newState.channel?.id
          ? `> <#${newState.channel.id}>` + '(`' + newState.channel.id + '`)'
          : '없음',
      })
      .setType('success');
    updated = true;
  }

  if ((oldState.channel && newState.channel) && oldState.channel != newState.channel) {
    if (!checkLogFlag(LoggerSettingDB.loggerFlags, LogFlags.VOICE_CHANNEL_JOIN)) return;
    embed
      .setTitle('음성채널 이동')
      .addFields(
        {
          name: '기존 채널',
          value: newState.channel?.id
            ? `> <#${newState.channel.id}>` + '(`' + newState.channel.id + '`)'
            : '없음',
        },
        {
          name: '이동 채널',
          value: oldState.channel?.id
            ? `> <#${oldState.channel.id}>` + '(`' + oldState.channel.id + '`)'
            : '없음',
        },
      )
      .setType('info');
    updated = true;
  }

  if (updated) {
    const customBot = await custombotSchema.findOne({
      guildId: newState.guild?.id,
      useage: true,
    });

    if (customBot) {
      client.socket.emit(SOCKET_ACTIONS.SEND_LOG_MESSAGE, {
        guildId: newState.guild?.id,
        channelId: logChannel.id,
        embed: embed.toJSON(),
      })
      return
    } else {
      return await logChannel.send({ embeds: [embed] });
    }
  }
}

const musicSessionHandler = async (client: BotClient, oldState: VoiceState, newState: VoiceState) => {
  const musicSessionStore = new MusicSessionStore(client.redisClient);

  if (!oldState.channel && newState.channel) {
    await musicSessionStore.set(newState.guild.id, client.lavalink.nodeManager.leastUsedNodes('memory')[0].sessionId as string);
  }
}