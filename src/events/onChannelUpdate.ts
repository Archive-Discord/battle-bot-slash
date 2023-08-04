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
import { checkLogFlag, LogFlags, sendLoggers, SOCKET_ACTIONS } from '../utils/Utils';
import custombotSchema from '../schemas/custombotSchema';

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
    value: `> <#${newChannel.id}>` + '(`' + newChannel.id + '`)',
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

  if (oldChannel.permissionOverwrites.cache != newChannel.permissionOverwrites.cache) {
    const overwriteChanges = [
      ...oldChannel.permissionOverwrites.cache.keys(),
      ...newChannel.permissionOverwrites.cache.keys(),
      // Remove duplicates
    ].reduce((out, next: string) => (out.includes(next as never) ? out : out.concat(next as never)), [])
      .map((id) => ({
        id,
        before: oldChannel.permissionOverwrites.cache.get(id),
        after: newChannel.permissionOverwrites.cache.get(id),
      }))
      // find diffrents
      .map(({ id, before, after }) => ({
        id,
        type: before ? before.type : after?.type,
        added: !after ? [] : (before ? after.allow.remove(before.allow) : after.allow).toArray(),
        denied: !after ? [] : (before ? after.deny.remove(before.deny) : after.deny).toArray(),
        removed: !before ? [] : [...before.allow.toArray(), ...before.deny.toArray()].filter((it) =>
          (after ? ![...after.allow.toArray(), ...after.deny.toArray()].includes(it) : true)),
      }))
      // filter overwrites which were not changed
      .filter(({ removed, added, denied }) => removed.length || added.length || denied.length);

    if (overwriteChanges.length > 0) {
      embed.setDescription('권한 변경');
      overwriteChanges.forEach((overwrite) => {
        embed.addFields({
          name: `> ${newChannel.guild.roles.cache.get(overwrite.id)?.name} ` + '(`' + overwrite.id + '`)',
          value: `${overwrite.added.length > 0 ? "추가: " + overwrite.added.map((p) => `\`${p}\``).join(', ') + "\n" : ''}${overwrite.removed.length > 0 ? '제거: ' + overwrite.removed.map((p) => `\`${p}\``).join(', ') + '\n' : ''}${overwrite.denied.length > 0 ? '거부: ' + overwrite.denied.map((p) => `\`${p}\``).join(', ') + '\n' : ''}`,
        });
      })
      updated = true;
    }
  }

  if (updated) {
    if (fetchedLogs) {
      const deletionLog = fetchedLogs.entries.first() as unknown as GuildAuditLogsEntry;
      const executor = deletionLog.executor as User;
      const target = deletionLog.target as GuildChannel;
      if (target.id === newChannel.id) {
        embed.addFields({
          name: '수정유저',
          value: `> <@${executor.id}>` + '(`' + executor.id + '`)',
        });
      }
    }

    sendLoggers(client, newChannel.guild, embed, LogFlags.CHANNEL_UPDATE)
  }
});
