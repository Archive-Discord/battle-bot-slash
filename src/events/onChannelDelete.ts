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

export default new Event('channelDelete', async (client, channel) => {
  if (channel.type === ChannelType.DM) return;
  const LoggerSettingDB = await LoggerSetting.findOne({
    guild_id: channel.guild.id,
  });
  if (!LoggerSettingDB) return;
  if (!checkLogFlag(LoggerSettingDB.loggerFlags, LogFlags.CHANNEL_DELETE)) return;
  const logChannel = channel.guild.channels.cache.get(
    LoggerSettingDB.guild_channel_id,
  ) as TextChannel;
  if (!logChannel) return;
  const fetchedLogs = await channel.guild.fetchAuditLogs({
    limit: 1,
    type: AuditLogEvent.ChannelDelete,
  });
  const embed = new Embed(client, 'error').setTitle('채널 삭제').addFields(
    {
      name: '채널',
      value: `#${channel.name}` + '(`' + channel.id + '`)',
    },
    {
      name: '카테고리',
      value: channel.parent ? channel.parent.name : '없음',
    },
  );
  if (!fetchedLogs) return await logChannel.send({ embeds: [embed] });
  const deletionLog = fetchedLogs.entries.first() as unknown as GuildAuditLogsEntry;
  const executor = deletionLog.executor as User;
  const target = deletionLog.target as GuildChannel;
  if (target.id === channel.id) {
    embed.addFields({
      name: '삭제유저',
      value: `<@${executor.id}>` + '(`' + executor.id + '`)',
    });
  }

  sendLoggers(client, channel.guild, embed, LogFlags.CHANNEL_DELETE)
});
