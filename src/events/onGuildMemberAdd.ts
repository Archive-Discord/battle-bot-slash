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

const guildLastJoin = new Map<string, Date>();
const guildLastJoinUser = new Map<string, string>();
const log = new Logger('GuildMemberAddEvent');

export default new Event('guildMemberAdd', async (client, member) => {
  WelecomEvent(client, member);
  WelecomLogEvent(client, member);
  AutoModEvent(client, member);
  AutoModCreateAtEvent(client, member);
  AutoModAutoRoleEvent(client, member);
  AutoModTokenUserEvent(client, member);
});

const WelecomEvent = async (client: BotClient, member: GuildMember) => {
  const WelcomeSettingDB = await WelcomeSetting.findOne({
    guild_id: member.guild.id,
  });
  if (!WelcomeSettingDB) return;
  if (!WelcomeSettingDB.welcome_message || WelcomeSettingDB.welcome_message == '') return;
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

const WelecomLogEvent = async (client: BotClient, member: GuildMember) => {
  const LoggerSettingDB = await LoggerSetting.findOne({
    guild_id: member.guild.id,
  });
  if (!LoggerSettingDB) return;
  if (!LoggerSettingDB.useing.memberJoin) return;
  const logChannel = member.guild.channels.cache.get(
    LoggerSettingDB.guild_channel_id,
  ) as TextChannel;
  if (!logChannel) return;
  const embed = new Embed(client, 'success')
    .setTitle('멤버 추가')
    .setAuthor({
      name: member.user.username,
      iconURL: member.user.displayAvatarURL(),
    })
    .addFields({
      name: '유저',
      value: `<@${member.user.id}>` + '(`' + member.user.id + '`)',
    });
  return await logChannel.send({ embeds: [embed] });
};

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
