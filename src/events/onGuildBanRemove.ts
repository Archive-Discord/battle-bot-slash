import { AuditLogEvent, TextChannel, User } from 'discord.js';
import LoggerSetting from '../schemas/LogSettingSchema';
import Embed from '../utils/Embed';
import { Event } from '../structures/Event';
import { checkLogFlag, LogFlags, sendLoggers, SOCKET_ACTIONS } from '../utils/Utils';
import custombotSchema from '../schemas/custombotSchema';

export default new Event('guildBanRemove', async (client, ban) => {
  const LoggerSettingDB = await LoggerSetting.findOne({
    guild_id: ban.guild.id,
  });
  if (!LoggerSettingDB) return;
  if (!checkLogFlag(LoggerSettingDB.loggerFlags, LogFlags.USER_BAN)) return;
  const logChannel = ban.guild.channels.cache.get(LoggerSettingDB.guild_channel_id) as TextChannel;
  if (!logChannel) return;
  const fetchedLogs = await ban.guild.fetchAuditLogs({
    limit: 1,
    type: AuditLogEvent.MemberBanRemove,
  });
  const deletionLog = fetchedLogs.entries.first();
  const embed = new Embed(client, 'warn')
    .setTitle('멤버 차단 해제')
    .setAuthor({
      name: ban.user.username,
      iconURL: ban.user.displayAvatarURL(),
    })
    .addFields({
      name: '유저',
      value: `> <@${ban.user.id}>` + '(`' + ban.user.id + '`)',
    });
  if (!deletionLog) return await logChannel.send({ embeds: [embed] });
  const executor = deletionLog.executor as User;
  const target = deletionLog.target as User;
  if (target.id == ban.user.id) {
    embed.addFields({
      name: '관리자',
      value: `> <@${executor.id}>` + '(`' + executor.id + '`)',
    });
  }

  sendLoggers(client, ban.guild, embed, LogFlags.USER_BAN)
});
