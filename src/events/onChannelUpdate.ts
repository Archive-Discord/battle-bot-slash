import {
  AuditLogEvent,
  ChannelType,
  GuildAuditLogsEntry,
  GuildChannel,
  TextChannel,
  User,
} from 'discord.js';
import LoggerSetting from '../schemas/LogSettingSchema';
import Embed from '../utils/Embed';
import { Event } from '../structures/Event';
import { checkLogFlag, LogFlags } from '../utils/Utils';

export default new Event('channelUpdate', async (client, newChannel, oldChannel) => {
  if (oldChannel.type === ChannelType.DM) return;
  if (newChannel.type === ChannelType.DM) return;

  const LoggerSettingDB = await LoggerSetting.findOne({
    guild_id: newChannel.guild.id,
  });
  if (!LoggerSettingDB) return;
  if (!checkLogFlag(LoggerSettingDB.loggerFlags, LogFlags.CHANNEL_UPDATE)) return;
  const logChannel = newChannel.guild.channels.cache.get(
    LoggerSettingDB.guild_channel_id,
  ) as TextChannel;
  if (!logChannel) return;
  const fetchedLogs = await newChannel.guild.fetchAuditLogs({
    limit: 1,
    type: AuditLogEvent.ChannelUpdate,
  });
  let updated = false;
  const embed = new Embed(client, 'warn').setTitle('채널 수정').addFields({
    name: '채널',
    value: `<#${newChannel.id}>` + '(`' + newChannel.id + '`)',
  });
  if (oldChannel.name != newChannel.name) {
    embed.addFields({
      name: '이름 수정',
      value: '`' + oldChannel.name + '`' + ' -> ' + '`' + newChannel.name + '`',
    });
    updated = true;
  }
  if (oldChannel.parent != newChannel.parent) {
    embed.addFields({
      name: '카테고리 변경',
      value:
        '`' +
        (oldChannel.parent ? oldChannel.parent.name : '없음') +
        '`' +
        ' -> ' +
        '`' +
        (newChannel.parent ? newChannel.parent.name : '없음') +
        '`',
    });
    updated = true;
  }

  if (updated) {
    if (!fetchedLogs) return await logChannel.send({ embeds: [embed] });
    const deletionLog = fetchedLogs.entries.first() as unknown as GuildAuditLogsEntry;
    const executor = deletionLog.executor as User;
    const target = deletionLog.target as GuildChannel;
    if (target.id !== newChannel.id) return await logChannel.send({ embeds: [embed] });
    embed.addFields({
      name: '수정유저',
      value: `<@${executor.id}>` + '(`' + executor.id + '`)',
    });
    return await logChannel.send({ embeds: [embed] });
  }
});
