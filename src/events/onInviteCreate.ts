import { Guild, TextChannel, User } from 'discord.js';
import LoggerSetting from '../schemas/LogSettingSchema';
import Embed from '../utils/Embed';
import { Event } from '../structures/Event';
import { checkLogFlag, LogFlags, sendLoggers, SOCKET_ACTIONS } from '../utils/Utils';
import custombotSchema from '../schemas/custombotSchema';

export default new Event('inviteCreate', async (client, invite) => {
  const guild = invite.guild as Guild;
  const inviter = invite.inviter as User;
  const LoggerSettingDB = await LoggerSetting.findOne({ guild_id: guild.id });
  if (!LoggerSettingDB) return;
  if (!checkLogFlag(LoggerSettingDB.loggerFlags, LogFlags.SERVER_INVITE)) return;
  const logChannel = guild.channels.cache.get(LoggerSettingDB.guild_channel_id) as TextChannel;
  if (!logChannel) return;
  const embed = new Embed(client, 'success')
    .setTitle('초대코드 생성')
    .addFields([{
      name: "유저",
      value: `> <@${inviter.id}>(\`${inviter.id}\`)`,
    }, {
      name: "채널",
      value: `> ${invite.channel ? `<#${invite.channel.id}>` : '없음'}`,
    }, {
      name: "코드",
      value: `> \`${invite.code}\``,
    }, {
      name: "사용가능 횟수",
      value: `> \`${invite.maxUses === 0 ? '무제한' : invite.maxUses}\``,
    }, {
      name: "사용 가능일",
      value: `> ${invite.maxAge != 0 ? invite.maxAge : '무제한'}`,
    }])

  sendLoggers(client, guild, embed, LogFlags.SERVER_INVITE)
});
