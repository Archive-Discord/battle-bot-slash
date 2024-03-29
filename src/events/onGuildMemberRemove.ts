import { TextChannel, GuildMember, PartialGuildMember } from 'discord.js';
import LoggerSetting from '../schemas/LogSettingSchema';
import WelcomeSetting from '../schemas/WelcomeSettingSchema';
import BotClient from '../structures/BotClient';
import Embed from '../utils/Embed';
import { Event } from '../structures/Event';
import { checkLogFlag, LogFlags, sendLoggers, SOCKET_ACTIONS } from '../utils/Utils';
import Logger from '../utils/Logger';
import custombotSchema from '../schemas/custombotSchema';

const logger = new Logger('GuildMemberRemoveEvent');

export default new Event('guildMemberRemove', async (client, member) => {
  LoggerEvent(client, member);
  GreetingEventV2(client, member);
});

const GreetingEventV2 = async (client: BotClient, member: GuildMember | PartialGuildMember) => {
  const WelcomeSettingDB = await WelcomeSetting.findOne({
    guild_id: member.guild.id,
  });
  if (!WelcomeSettingDB) return;
  if (!WelcomeSettingDB.outting_message || WelcomeSettingDB.outting_message == '' || !WelcomeSettingDB.message_type) return;

  const embed = new Embed(client, 'warn');
  embed
    .setAuthor({
      name: member.user.username,
      iconURL: member.user.displayAvatarURL(),
    })
    .setDescription(
      new String(WelcomeSettingDB.outting_message)
        .replaceAll('${username}', member.user.username)
        .replaceAll('${discriminator}', member.user.discriminator)
        .replaceAll('${servername}', member.guild.name)
        .replaceAll(
          '${memberCount}',
          member.guild.memberCount.toString().replaceAll('${줄바꿈}', '\n'),
        ),
    );

  const customBot = await custombotSchema.findOne({
    guildId: member.guild.id,
    useage: true,
  });

  if (customBot) {
    client.socket.emit(SOCKET_ACTIONS.SEND_OUTTING_MESSAGE, {
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
      logger.error(error as string);
    }
  }
};

const LoggerEvent = async (client: BotClient, member: GuildMember | PartialGuildMember) => {
  const LoggerSettingDB = await LoggerSetting.findOne({
    guild_id: member.guild.id,
  });
  if (!LoggerSettingDB) return;
  if (!checkLogFlag(LoggerSettingDB.loggerFlags, LogFlags.USER_LEAVE)) return;
  const logChannel = member.guild.channels.cache.get(
    LoggerSettingDB.guild_channel_id,
  ) as TextChannel;
  if (!logChannel) return;
  const embed = new Embed(client, 'error')
    .setTitle('멤버 퇴장')
    .addFields({
      name: '유저',
      value: `> <@${member.user.id}>` + '(`' + member.user.id + '`)',
    });

  sendLoggers(client, member.guild, embed, LogFlags.USER_LEAVE)
};
