import { GuildMember, TextChannel } from 'discord.js';
import Automod from '../schemas/autoModSchema';
import Blacklist from '../schemas/blacklistSchemas';
import LoggerSetting from '../schemas/LogSettingSchema';
import WelcomeSetting from '../schemas/WelcomeSettingSchema';
import BotClient from '../structures/BotClient';
import Embed from '../utils/Embed';
import { Event } from '../structures/Event';
import Logger from '../utils/Logger';
import checkPremium from '../utils/checkPremium';
import { checkLogFlag, LogFlags, sendLoggers, SOCKET_ACTIONS } from '../utils/Utils';
import custombotSchema from '../schemas/custombotSchema';

const guildLastJoin = new Map<string, Date>();
const guildLastJoinUser = new Map<string, string>();
const log = new Logger('GuildMemberAddEvent');

export default new Event('guildMemberAdd', async (client, member) => {
  WelecomLogEvent(client, member);
  WelecomEventV2(client, member);
  AutoModBlacklistEventV2(client, member);
  AutoModAutoRoleEventV2(client, member);
  AutoModCreateAtEventV2(client, member);
});

const WelecomEventV2 = async (client: BotClient, member: GuildMember) => {
  const WelcomeSettingDB = await WelcomeSetting.findOne({
    guild_id: member.guild.id,
  });
  if (!WelcomeSettingDB) return;
  if (!WelcomeSettingDB.welcome_message || WelcomeSettingDB.welcome_message == '' || !WelcomeSettingDB.message_type) return;

  const embed = new Embed(client, 'warn');
  embed
    .setAuthor({
      name: member.user.username,
      iconURL: member.user.displayAvatarURL(),
    })
    .setDescription(
      new String(WelcomeSettingDB.welcome_message)
        .replaceAll('${username}', member.user.username)
        .replaceAll('${discriminator}', member.user.discriminator)
        .replaceAll('${servername}', member.guild.name)
        .replaceAll(
          '${memberCount}',
          member.guild.memberCount.toString(),
        ).replaceAll('${줄바꿈}', '\n')
      ,
    );

  const customBot = await custombotSchema.findOne({
    guildId: member.guild.id,
    useage: true,
  });

  if (customBot) {
    client.socket.emit(SOCKET_ACTIONS.SEND_WELCOME_MESSAGE, {
      userId: member.user.id,
      guildId: member.guild.id,
      channelId: WelcomeSettingDB.channel_id,
      embed: embed.toJSON(),
      type: WelcomeSettingDB.message_type || 'guild',
    })
    return
  } else {
    try {
      if (WelcomeSettingDB.message_type === "guild") {
        const WelcomeChannel = member.guild.channels.cache.get(
          WelcomeSettingDB.channel_id!,
        ) as TextChannel;
        if (!WelcomeChannel) return;
        return await WelcomeChannel.send({ embeds: [embed] });
      } else if (WelcomeSettingDB.message_type === "dm") {
        return await member.send({ embeds: [embed] });
      }
    } catch (error) {
      log.error(error as string);
    }
  }
}

const WelecomLogEvent = async (client: BotClient, member: GuildMember) => {
  const LoggerSettingDB = await LoggerSetting.findOne({
    guild_id: member.guild.id,
  });
  if (!LoggerSettingDB) return;
  if (!checkLogFlag(LoggerSettingDB.loggerFlags, LogFlags.USER_JOIN)) return;
  const logChannel = member.guild.channels.cache.get(
    LoggerSettingDB.guild_channel_id,
  ) as TextChannel;
  if (!logChannel) return;
  const embed = new Embed(client, 'success')
    .setTitle('멤버 추가')
    .addFields({
      name: '유저',
      value: `> <@${member.user.id}>` + '(`' + member.user.id + '`)',
    });

  sendLoggers(client, member.guild, embed, LogFlags.USER_JOIN)
};

/**
 * @description 자동차단 이벤트 (블랙리스트) V2
 */
const AutoModBlacklistEventV2 = async (client: BotClient, member: GuildMember) => {
  const automodDB = await Automod.findOne({ guildId: member.guild.id, event: 'blacklist_ban' });
  if (!automodDB) return;
  if (!automodDB.start) return
  const banlist = await Blacklist.findOne({ status: 'blocked', user_id: member.id });
  if (!banlist) return;
  return await member.ban({ reason: `[배틀이 자동차단] ${banlist.reason}` });
}

const AutoModCreateAtEventV2 = async (client: BotClient, member: GuildMember) => {
  const automodDB = await Automod.findOne({ guildId: member.guild.id, event: 'usercreateat' });
  if (!automodDB) return;
  if (!automodDB.start) return;
  const isPremium = await checkPremium(client, member.guild);
  if (!isPremium) {
    const LoggerSettingDB = await LoggerSetting.findOne({
      guild_id: member.guild.id,
    });
    if (!LoggerSettingDB) return;
    const logChannel = member.guild.channels.cache.get(
      LoggerSettingDB.guild_channel_id,
    ) as TextChannel;
    if (!logChannel) return;
    return logChannel.send('프리미엄 기한 만료로 유저 생성일 제한 기능이 비활성화되었습니다');
  }

  const now = new Date();
  const elapsedDate = Math.round(
    (Number(now) - Number(member.user.createdAt)) / 1000 / 60 / 60 / 24,
  );

  if (elapsedDate < Number(automodDB.start)) {
    try {
      const embed = new Embed(client, 'error')
        .setTitle('배틀이 자동 시스템')
        .setDescription(
          `해당 서버는 계정 생성후 ${automodDB.start}일이 지나야 입장이 가능합니다`,
        );
      await member.send({ embeds: [embed] });
    } catch (e: any) {
      log.error(e);
    }
    return member.kick();
  }
}

/**
 * @description 자동역할 이벤트 V2
 */
const AutoModAutoRoleEventV2 = async (client: BotClient, member: GuildMember) => {
  const automodDB = await Automod.findOne({ guildId: member.guild.id, event: 'autorole' });
  if (!automodDB) return;
  if (!automodDB.start) return;
  const role = member.guild.roles.cache.get(automodDB.start as string);
  if (!role) return;
  try {
    return member.roles.add(role);
  } catch (e) {
    return;
  }
}
