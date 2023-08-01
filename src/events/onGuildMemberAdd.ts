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
import { checkLogFlag, LogFlags, SOCKET_ACTIONS } from '../utils/Utils';
import custombotSchema from '../schemas/custombotSchema';

const guildLastJoin = new Map<string, Date>();
const guildLastJoinUser = new Map<string, string>();
const log = new Logger('GuildMemberAddEvent');

export default new Event('guildMemberAdd', async (client, member) => {
  WelecomEvent(client, member);
  AutoModEvent(client, member);
  AutoModCreateAtEvent(client, member);
  AutoModAutoRoleEvent(client, member);
  // AutoModTokenUserEvent(client, member);
  WelecomLogEvent(client, member);
  WelecomEventV2(client, member);
  AutoModBlacklistEventV2(client, member);
  AutoModAutoRoleEventV2(client, member);
  AutoModCreateAtEventV2(client, member);
});

/**
 * @deprecated {@link AutoModBlacklistEventV2} 환영 메시지 - 8월 15일까지만 지원
 */
const WelecomEvent = async (client: BotClient, member: GuildMember) => {
  const WelcomeSettingDB = await WelcomeSetting.findOne({
    guild_id: member.guild.id,
  });
  if (!WelcomeSettingDB) return;
  if (!WelcomeSettingDB.welcome_message || WelcomeSettingDB.welcome_message == '' || WelcomeSettingDB.message_type) return;
  const WelcomeChannel = member.guild.channels.cache.get(
    WelcomeSettingDB.channel_id!,
  ) as TextChannel;
  if (!WelcomeChannel) return;
  const embed = new Embed(client, 'success')
    .setAuthor({
      name: member.user.username,
      iconURL: member.user.displayAvatarURL(),
    })
    .setDescription(
      new String(WelcomeSettingDB.welcome_message)
        .replaceAll('${username}', member.user.username)
        .replaceAll('${discriminator}', member.user.discriminator)
        .replaceAll('${servername}', member.guild.name)
        .replaceAll('${memberCount}', member.guild.memberCount.toString())
        .replaceAll('${줄바꿈}', '\n'),
    );
  return await WelcomeChannel.send({ embeds: [embed] });
};

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

  const customBot = await custombotSchema.findOne({
    guildId: member.guild.id,
    useage: true,
  });

  if (customBot) {
    client.socket.emit(SOCKET_ACTIONS.SEND_LOG_MESSAGE, {
      guildId: member.guild.id,
      channelId: logChannel.id,
      embed: embed.toJSON(),
    })
    return
  } else {
    return await logChannel.send({ embeds: [embed] });
  }
};

/**
 * @deprecated {@link AutoModBlacklistEventV2} 자동차단 (블랙리스트) - 8월 15일까지만 지원
 */
const AutoModEvent = async (client: BotClient, member: GuildMember) => {
  const automodDB = await Automod.findOne({ guild_id: member.guild.id });
  if (!automodDB) return;
  if (automodDB.useing.useBlackList) {
    const banlist = await Blacklist.find({ status: 'blocked' });
    const isUser = banlist.some((user) => user.user_id === member.id);
    if (isUser) {
      const user = await Blacklist.findOne({ user_id: member.id });
      return await member.ban({ reason: `[배틀이 자동차단] ${user?.reason}` });
    } else {
      return;
    }
  } else {
    return;
  }
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

/**
 * @deprecated {@link AutoModCreateAtEventV2} 유저 생성일 제한 - 8월 15일까지만 지원
 */
const AutoModCreateAtEvent = async (client: BotClient, member: GuildMember) => {
  const automodDB = await Automod.findOne({ guild_id: member.guild.id });
  const isPremium = await checkPremium(client, member.guild);
  if (!automodDB) return;
  if (!automodDB.useing.useCreateAt || automodDB.useing.useCreateAt === 0) return;
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
  if (elapsedDate < automodDB.useing.useCreateAt) {
    try {
      const embed = new Embed(client, 'error')
        .setTitle('배틀이 자동 시스템')
        .setDescription(
          `해당 서버는 계정 생성후 ${automodDB.useing.useCreateAt}일이 지나야 입장이 가능합니다`,
        );
      await member.send({ embeds: [embed] });
    } catch (e: any) {
      log.error(e);
    }
    return member.kick();
  } else {
    return;
  }
};

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
 * @deprecated {@link AutoModAutoRoleEventV2} 자동역할 - 8월 15일까지만 지원
 */
const AutoModAutoRoleEvent = async (client: BotClient, member: GuildMember) => {
  const automodDB = await Automod.findOne({ guild_id: member.guild.id });
  if (!automodDB) return;
  if (!automodDB.useing.useAutoRole) return;
  const role = member.guild.roles.cache.get(automodDB.useing.autoRoleId as string);
  if (!role) return;
  try {
    return member.roles.add(role);
  } catch (e) {
    return;
  }
};

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

const AutoModTokenUserEvent = async (client: BotClient, member: GuildMember) => {
  if (member.guild.id !== '786153760824492062') return;
  const guildLastJoinData = guildLastJoin.get(member.guild.id);
  const guildLastJoinUserData = guildLastJoinUser.get(member.guild.id);
  if (!guildLastJoinData || !guildLastJoinUserData) {
    guildLastJoin.set(member.guild.id, new Date());
    guildLastJoinUser.set(member.guild.id, member.id);
  } else {
    if (new Date().getTime() - guildLastJoinData.getTime() < 1000 && !member.avatar) {
      const guildLastJoinUserData = guildLastJoinUser.get(member.guild.id);
      if (member.id === guildLastJoinUserData) return;
      const guildLastJoinUserDataMember = client.users.cache.get(guildLastJoinUserData as string);
      if (!guildLastJoinUserDataMember) return;
      if (
        member.user.createdAt.getMonth() === guildLastJoinUserDataMember.createdAt.getMonth() &&
        member.user.createdAt.getDate() === guildLastJoinUserDataMember.createdAt.getDate()
      ) {
        const embed = new Embed(client, 'error')
          .setTitle('배틀이 자동 시스템')
          .setDescription(
            `토큰 유저 의심 계정으로 추방되었습니다.\n**오류라고 생각될 경우 [여기](https://discord.gg/WtGq7D7BZm)로 문의해 주세요**`,
          );
        try {
          await member.send({ embeds: [embed] });
          await member.kick();
        } catch (e: any) {
          log.error(e);
        }
      }
    }
  }
};
