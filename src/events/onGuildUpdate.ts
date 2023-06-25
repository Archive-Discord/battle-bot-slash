import { TextChannel } from 'discord.js';
import LoggerSetting from '../schemas/LogSettingSchema';
import Embed from '../utils/Embed';
import { Event } from '../structures/Event';
import { LogFlags } from '../../typings';
import { checkLogFlag } from '../utils/Utils';

export default new Event('guildUpdate', async (client, oldGuild, newGuild) => {
  const LoggerSettingDB = await LoggerSetting.findOne({ guild_id: newGuild.id });
  if (!LoggerSettingDB) return;
  if (!checkLogFlag(LoggerSettingDB.loggerFlags, LogFlags.SERVER_SETTINGS)) return;
  const logChannel = newGuild.channels.cache.get(LoggerSettingDB.guild_channel_id) as TextChannel;
  if (!logChannel) return;
  let update = false;
  const embed = new Embed(client, 'warn').setTitle('서버 수정');
  if (oldGuild.name != newGuild.name) {
    embed.addFields({
      name: '이름 수정',
      value: '`' + oldGuild.name + '`' + ' -> ' + '`' + newGuild.name + '`',
    });
    update = true;
  }
  if (oldGuild.premiumTier !== newGuild.premiumTier) {
    embed.addFields({
      name: `부스트 ${oldGuild.premiumTier < newGuild.premiumTier ? '추가됨' : '차감됨'}`,
      value: '`' + oldGuild.premiumTier + '`' + ' -> ' + '`' + newGuild.premiumTier + '`',
    });
    update = true;
  }
  if (!oldGuild.banner && newGuild.banner) {
    embed.addFields({
      name: '배너 수정',
      value: '`' + oldGuild.banner + '`' + ' -> ' + '`' + newGuild.banner + '`',
    });
    update = true;
  }
  if (!oldGuild.afkChannel && newGuild.afkChannel) {
    embed.addFields({
      name: '잠수 채널 수정',
      value:
        (oldGuild.afkChannelId
          ? `<#${oldGuild.afkChannelId}>` + '(`' + oldGuild.afkChannelId + '`)'
          : '`없음`') +
        ' -> ' +
        (newGuild.afkChannelId
          ? `<#${newGuild.afkChannelId}>` + '(`' + newGuild.afkChannelId + '`)'
          : '`없음`'),
    });
    update = true;
  }
  if (!oldGuild.vanityURLCode && newGuild.vanityURLCode) {
    embed.addFields({
      name: '초대 링크 수정',
      value:
        (oldGuild.vanityURLCode ? oldGuild.vanityURLCode : '`없음`') +
        ' -> ' +
        (newGuild.vanityURLCode ? newGuild.vanityURLCode : '`없음`'),
    });
    update = true;
  }
  if (oldGuild.afkTimeout !== newGuild.afkTimeout) {
    embed.addFields({
      name: '잠수 시간 수정',
      value:
        '`' +
        oldGuild.afkTimeout / 60 +
        '분' +
        '`' +
        ' -> ' +
        '`' +
        newGuild.afkTimeout / 60 +
        '분' +
        '`',
    });
    update = true;
  }
  if (oldGuild.ownerId !== newGuild.ownerId) {
    embed.addFields({
      name: '서버 주인 변경',
      value:
        `<@${oldGuild.ownerId}>` +
        '(`' +
        oldGuild.ownerId +
        '`)' +
        ' -> ' +
        `<@${newGuild.ownerId}>` +
        '(`' +
        newGuild.ownerId +
        '`)',
    });
    update = true;
  }
  if (oldGuild.systemChannelId !== newGuild.systemChannelId) {
    embed.addFields({
      name: '시스템 채널 변경',
      value:
        `<#${oldGuild.systemChannelId}>` +
        '(`' +
        oldGuild.systemChannelId +
        '`)' +
        ' -> ' +
        `<#${newGuild.systemChannelId}>` +
        '(`' +
        newGuild.systemChannelId +
        '`)',
    });
    update = true;
  }
  if (update) return await logChannel.send({ embeds: [embed] });
});
