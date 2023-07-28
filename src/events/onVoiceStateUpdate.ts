import { Event } from '../structures/Event';
import LoggerSetting from '../schemas/LogSettingSchema';
import Embed from '../utils/Embed';
import { TextChannel, VoiceState } from 'discord.js';
import { checkLogFlag, LogFlags } from '../utils/Utils';
import BotClient from '../structures/BotClient';

export default new Event('voiceStateUpdate', async (client, oldState, newState) => {
  if (!newState.guild) return;
  Music_AutoStop(client, oldState, newState);
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
    value: `<@${newState.member?.id}>` + '(`' + newState.member?.id + '`)',
    inline: true,
  });
  let updated = false;
  if (!newState.channel) {
    if (!checkLogFlag(LoggerSettingDB.loggerFlags, LogFlags.VOICE_CHANNEL_LEAVE)) return; embed
      .setTitle('음성채널 퇴장')
      .addFields({
        name: '채널',
        value: oldState.channel?.id
          ? `<#${oldState.channel.id}>` + '(`' + oldState.channel.id + '`)'
          : '없음',
        inline: true,
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
          ? `<#${newState.channel.id}>` + '(`' + newState.channel.id + '`)'
          : '없음',
        inline: true,
      })
      .setType('success');
    updated = true;
  }
  if (updated) return await logChannel.send({ embeds: [embed] });
});

async function Music_AutoStop(client: BotClient, oldState: VoiceState, newState: VoiceState) { // 셋업뮤직 자동 퇴장
  const musicbase = await client.musics.get(newState.guild.id)
  if (!musicbase) return
  const channel = await client.channels.cache.get(musicbase?.textChannel || '0000') as TextChannel;
  async function clear() {
    if (!musicbase?.paused && !musicbase?.playing) {
      await musicbase?.destroy()
      if (channel) await channel?.send({
        embeds: [
          new Embed(client, 'info')
            .setDescription(`음성채널에 아무도 없어 음성채널에서 나갔습니다!`)
        ]
      }).then((m) => {
        setTimeout(() => {
          try {
            m.delete()
          } catch (e) { /* eslint-disable-next-line no-empty */ }
        }, 15000)
      })
      return true;
    }
  }
  async function stop() {
    await musicbase?.queue.clear()
    await musicbase?.stop()
    const voice = new Embed(client, 'default')
      .setDescription("음성채널이 일정시간동안 비어 플레이어를 종료했어요!")
    try {
      return await channel.send({ embeds: [voice] }).then((m) => {
        setTimeout(() => {
          try {
            m.delete()
          } catch (e) { /* eslint-disable-next-line no-empty */ }
        }, 15000)
      })
    } catch (err) { /* empty */ }
  }
  const mem = await newState.channel?.members.size || 0;
  const guild = await client.guilds.cache.get(newState.guild.id)
  if (newState.channel?.id !== musicbase?.voiceChannel) {
    if (guild?.members?.me?.voice?.channel?.members?.size !== 1) return
    if (mem < 2) {
      if (await clear()) return
      return await stop()
    }
  }
}