import { AuditLogEvent, GuildAuditLogsEntry, GuildChannel, TextChannel, User } from 'discord.js';
import LoggerSetting from '../schemas/LogSettingSchema';
import Embed from '../utils/Embed';
import { Event } from '../structures/Event';
import { checkLogFlag, LogFlags, sendLoggers } from '../utils/Utils';

export default new Event('channelCreate', async (client, channel) => {
  const LoggerSettingDB = await LoggerSetting.findOne({
    guild_id: channel.guild.id,
  });
  if (!LoggerSettingDB) return;
  if (!checkLogFlag(LoggerSettingDB.loggerFlags, LogFlags.CHANNEL_CREATE)) return;
  const logChannel = channel.guild.channels.cache.get(
    LoggerSettingDB.guild_channel_id,
  ) as TextChannel;
  if (!logChannel) return;
  const fetchedLogs = await channel.guild.fetchAuditLogs({
    limit: 1,
    type: AuditLogEvent.ChannelCreate,
  });
  const embed = new Embed(client, 'success').setTitle('채널 생성').addFields(
    {
      name: '채널',
      value: `> <#${channel.id}>` + '(`' + channel.id + '`)',
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
      name: '생성유저',
      value: `> <@${executor.id}>` + '(`' + executor.id + '`)',
    });
  }

  sendLoggers(client, channel.guild, embed, LogFlags.CHANNEL_CREATE)
});
