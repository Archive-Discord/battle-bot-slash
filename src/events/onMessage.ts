import { Event } from '../structures/Event';
import CommandManager from '../managers/CommandManager';
import ErrorManager from '../managers/ErrorManager';
import { MessageCommand } from '../structures/Command';
import BotClient from '../structures/BotClient';
import { ChannelType, Message, RESTJSONErrorCodes, userMention } from 'discord.js';
import Automod from '../schemas/autoModSchema';
import Level from '../schemas/levelSchema';
import LevelSetting from '../schemas/levelSettingSchema';
import { check } from 'korcen';
import { checkUserPremium } from '../utils/checkPremium';
import { userWarnAdd } from '../utils/WarnHandler';
import MusicSetting from '../schemas/musicSchema';
import Logger from '../utils/Logger';
import { AutoModDB } from '../../typings';
import { Player } from 'lavalink-client';
import { liveStatus, createPlayer, playIfNotPlaying } from '../utils/music/channel.music';
import { sendError, sendSuccess } from '../utils/Utils';
import { MusicRequester } from '../utils/music/utils.music';
const LevelCooldown = new Map();
const logger = new Logger('MessageEvent');

export default new Event('messageCreate', async (client, message) => {
  const commandManager = new CommandManager(client);
  const errorManager = new ErrorManager(client);

  if (message.author.bot) return;
  if (message.channel.type === ChannelType.DM) return;

  ProfanityFilterV2(client, message);
  LinkFilterV2(client, message);
  LevelSystem(client, message);
  musicPlayer(client, message)
  if (!message.content.startsWith(client.config.bot.prefix)) return;

  const args = message.content.slice(client.config.bot.prefix.length).trim().split(/ +/g);
  const commandName = args.shift()?.toLowerCase();
  const command = commandManager.get(commandName as string) as MessageCommand;

  await client.dokdo.run(message);
  const find = await MusicSetting.findOne({ guildid: message.guild?.id, channel_id: message.channel?.id });
  if (find) {
    try {
      await message.delete()
    } catch (err) {
      console.log(err)
    }
  }
  try {
    await command?.execute(client, message, args);
  } catch (error: any) {
    if (error?.code === RESTJSONErrorCodes.MissingPermissions) {
      return;
    }
    errorManager.report(error, { executer: message, isSend: true });
  }
});

const LinkFilterV2 = async (client: BotClient, message: Message) => {
  if (!message.content) return;
  if (!message.guild) return;
  const automodDB = await Automod.findOne({ guildId: message.guild.id, event: "uselink" });
  if (!automodDB) return;
  if (!automodDB.start) return;
  if (/(http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-/]))?/.test(message.content)) {
    findCurseV2(automodDB, message, 'link', client);
  }
  return
}

const ProfanityFilterV2 = async (client: BotClient, message: Message) => {
  if (!message.content) return;
  if (!message.guild) return;
  const automodDB = await Automod.findOne({ guildId: message.guild.id, event: "usecurse" });
  if (!automodDB) return;
  if (!automodDB.start) return;
  if (check(message.content)) {
    findCurseV2(automodDB, message, 'curse', client);
  }
  return
}

const findCurseV2 = async (automodDB: AutoModDB, message: Message, type: "link" | "curse", client: BotClient) => {
  switch (automodDB.start) {
    case 'delete':
      await message.reply(`${type === "curse" ? "욕설" : "링크"} 사용으로 자동 삭제됩니다`).then((m) => {
        setTimeout(() => {
          try {
            m.delete()
          } catch (e) { /* eslint-disable-next-line no-empty */ }
        }, 5000);
      });
      try {
        message.delete();
      } catch (error) {
        logger.error(error as string);
      }
      break;
    case 'warning':
      await message.reply(`${type === "curse" ? "욕설" : "링크"} 사용으로 자동 삭제 후 경고가 지급됩니다`).then((m) => {
        setTimeout(() => {
          try {
            m.delete()
          } catch (e) { /* eslint-disable-next-line no-empty */ }
        }, 5000);
      });
      try {
        message.delete();
        return userWarnAdd(
          client,
          message.author.id,
          message.guild?.id as string,
          `[배틀이] ${type === "curse" ? "욕설" : "링크"} 사용 자동경고`,
          client.user?.id as string,
        );
      } catch (error) {
        logger.error(error as string);
      }
      break;
    case 'kick':
      await message.reply(`${type === "curse" ? "욕설" : "링크"} 사용으로 자동 삭제 후 추방됩니다`).then((m) => {
        setTimeout(() => {
          try {
            m.delete()
          } catch (e) { /* eslint-disable-next-line no-empty */ }
        }, 5000);
      });
      try {
        message.delete();
        return message.member?.kick();
      } catch (error) {
        logger.error(error as string);
      }
      break;
    case 'ban':
      await message.reply(`${type === "curse" ? "욕설" : "링크"} 사용으로 자동 삭제 후 차단됩니다`).then((m) => {
        setTimeout(() => {
          try {
            m.delete()
          } catch (e) { /* eslint-disable-next-line no-empty */ }
        }, 5000);
      });
      try {
        message.delete();
        return message.member?.ban({ reason: `[배틀이] ${type === "curse" ? "욕설" : "링크"} 사용 자동차단` });
      } catch (error) {
        logger.error(error as string);
      }
      break;
    default:
      break;
  }
};

const musicPlayer = async (client: BotClient, message: Message) => {
  if (!message.guild || !message.content) return;

  const musicDB = await MusicSetting.findOne({
    channel_id: message.channel.id,
    guild_id: message.guild.id
  });
  if (!musicDB) return;

  const prefixList = [client.config.bot.prefix, '!', '.', '$', '%', '&', '='];
  if (prefixList.some(prefix => message.content.startsWith(prefix))) {
    return message.delete();
  }

  await message.delete();

  const user = message.guild.members.cache.get(message.author.id);
  const channel = user?.voice.channel;
  if (!channel) {
    return sendError(message, '❌ 음성 채널에 먼저 입장해주세요!');
  }

  let player: Player | null = client.lavalink.getPlayer(message.guild.id)
  if (player && channel.id !== message.guild.members.me?.voice.channelId) {
    return sendError(message, '❌ 이미 다른 음성 채널에서 재생 중입니다!');
  }

  if (!player) {
    player = await createPlayer(client, message);
    if (!player) {
      return sendError(message, '❌ 음성 채널에 입장할 수 없어요');
    }
  }


  const song = await player.search(message.content, message.author);
  if (!song || !song.tracks.length) {
    return sendError(message, `❌ ${message.content}를 찾지 못했어요!`);
  }

  liveStatus(message.guild.id, client);

  if (song.playlist) {
    const songTitles = song.tracks.map(track => track.info.title);
    player.queue.add(song.tracks);
    await playIfNotPlaying(player);
    return sendSuccess(message, '재생목록에 아래 노래들을 추가했어요!', songTitles.join(', '));
  } else {
    player.queue.add(song.tracks[0]);
    await playIfNotPlaying(player);
    const requester = song.tracks[0].requester as MusicRequester
    return sendSuccess(message, '재생목록에 노래를 추가했어요!', `[${song.tracks[0].info.title}](${song.tracks[0].info.uri}) ${song.tracks[0].info.duration} - ${userMention(requester.id)}`, song.tracks[0].info.artworkUrl || undefined);
  }
}


/**
 * @deprecated 레벨 시스템 - 기존 서버는 유지되나 새로운 서버는 지원하지 않음
*/
const LevelSystem = async (client: BotClient, message: Message) => {
  if (!message.guild) return;
  if (
    [client.config.bot.prefix, '!', '.', '$', '%', '&', '=', ';;'].find((x) =>
      message.content.toLowerCase().startsWith(x),
    )
  )
    return;
  const levelSetting = await LevelSetting.findOne({
    guild_id: message.guild.id,
  });
  if (!levelSetting) return;
  if (!levelSetting.useage) return;
  if (!LevelCooldown.has(`${message.guild.id}_${message.author.id}`))
    LevelCooldown.set(`${message.guild.id}_${message.author.id}`, Date.now());
  const cooldown = LevelCooldown.get(`${message.guild.id}_${message.author.id}`);
  if (cooldown && Date.now() - cooldown > 1000) {
    const isPremium = await checkUserPremium(client, message.author);
    LevelCooldown.set(`${message.guild.id}_${message.author.id}`, Date.now());
    const levelData = await Level.findOne({
      guild_id: message.guild.id,
      user_id: message.author.id,
    });
    const level = levelData ? levelData.level : 1;
    const nextLevelXP = (!level ? 1 : level + 1) * 13;
    const xpPerLevel = '1'.toString().includes('-') ? '1'.split('-') : '1';
    const min = parseInt(xpPerLevel[0]);
    const max = parseInt(xpPerLevel[1]);
    let xpToAdd = Array.isArray(xpPerLevel)
      ? min + Math.floor((max - min) * Math.random())
      : xpPerLevel;
    if (isPremium) xpToAdd = Number(xpToAdd) * 1.3;
    if (!levelData || (levelData && levelData.currentXP < nextLevelXP))
      return await Level.findOneAndUpdate(
        { guild_id: message.guild.id, user_id: message.author.id },
        { $inc: { totalXP: xpToAdd, currentXP: xpToAdd } },
        { upsert: true },
      );
    const newData = await Level.findOneAndUpdate(
      { guild_id: message.guild.id, user_id: message.author.id },
      { $inc: { level: 1 }, $set: { currentXP: 0 } },
      { upsert: true, new: true },
    );
    /*const levelEmbed = new Embed(client, 'info')
    levelEmbed.setTitle(`${message.author.username}님의 레벨이 올랐어요!`)
    levelEmbed.setDescription(
      `레벨이 \`LV.${level ? level : 0} -> LV.${newData.level}\`로 올랐어요!`
    )*/
    return message.reply(
      `${message.author}님의 레벨이 \`LV.${level ? level : 0} -> LV.${newData.level}\`로 올랐어요!`,
    );
  }
};
