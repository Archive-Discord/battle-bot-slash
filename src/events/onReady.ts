import {
  ChannelType,
  ButtonStyle,
  ActionRowBuilder,
  ButtonBuilder,
  TextBasedChannel,
} from 'discord.js';
import Status from '../schemas/statusSchema';
import BotClient from '../structures/BotClient';
import { Event } from '../structures/Event';
import Embed from '../utils/Embed';
import Logger from '../utils/Logger';
import Premium from '../schemas/premiumSchemas';
import schedule from 'node-schedule';
import DateFormatting from '../utils/DateFormatting';
import Automod from '../schemas/autoModSchema';
import { GuildChannel } from 'discord.js';
import NFTUserWallet from '../schemas/NFTUserWalletSchema';
import NFTGuildVerify from '../schemas/NFTGuildVerifySchema';
import axios from 'axios';
import config from '../../config';
import CommandManager from '../managers/CommandManager';
import PremiumUser from '../schemas/premiumUserSchemas';
import MusicSetting from '../schemas/musicSchema';
import { format } from '../utils/Utils';

const logger = new Logger('bot');

export default new Event(
  'ready',
  async (client) => {
    setInterval(async () => {
      StatusUpdate(client);
    }, 60 * 1000 * 5);
    setInterval(async () => {
      ServerCountUpdate(client);
    }, 60 * 1000 * 10);
    schedule.scheduleJob('0 0 0 * * *', () => {
      PremiumAlert(client);
      automodResetChannel(client);
      nftChecker(client);
      PremiumPersonAlert(client);
    });

    const commandManager = new CommandManager(client);
    await commandManager.slashGlobalCommandSetup();

    client.music.init(client.user?.id);

    client.on('raw', (d) => client.music.updateVoiceState(d));
    client.music
      .on('nodeConnect', async (node) => {
        logger.scope = 'MusicManager';
        logger.info(`Music client ${node.options.identifier} connected!`);
      })
      .on('nodeError', async (_, e) => logger.error(e.message))
      .on('trackStart', async (player, track) => {
        if (!player.guild) return;
        const guild = await client.guilds.fetch(player.guild);
        const find = await MusicSetting.findOne({ guild_id: guild.id });
        const gdname = guild.name;
        const gdicon = guild.iconURL();
        const channel = client.channels.cache.get(player.textChannel!) as TextBasedChannel;
        const playl = new Embed(client, 'default')
          .setTitle('🎶 노래를 재생합니다! 🎶')
          .setURL(`${track.uri}`)
          .setColor('#2f3136')
          .setDescription(`\`${track.title}\`` + `(이)가 지금 재생되고 있습니다!`)
          .setFields(
            {
              name: `길이`,
              value: `\`${format(track.duration).split(' | ')[0]}\` | \`${format(track.duration).split(' | ')[1]
                }\``,
              inline: true,
            },
            { name: `게시자`, value: `${track.author}`, inline: true },
          )
          .setThumbnail(`${track.thumbnail}`);
        channel.send({ embeds: [playl] }).then((message) => {
          if (!message) return;
          setTimeout(async () => {
            try {
              await message.delete()
            } catch (e) {
              console.log(e)
            }
          }, 5000);
        });
        // const voic = guild.member.voice.channel.id
        // const textc = guild.channel.id
        if (find) {
          const player = client.music.players.get(guild.id);
          if (!player) return;
          const vaset = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
              .setCustomId('m_volume_up')
              .setLabel('⬆볼륨UP')
              .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
              .setCustomId('m_volume_down')
              .setLabel('⬇볼륨DOWN')
              .setStyle(ButtonStyle.Secondary),
          );

          const chid = find.channel_id;
          const msgid_list = find.messageid_list;
          const msgid_banner = find.messageid_banner;
          const channel = client.channels.cache.get(chid);

          if (!channel?.isTextBased()) return;

          const msg_list = await channel.messages.fetch(msgid_list);
          const msg_banner = await channel.messages.fetch(msgid_banner);
          if (!msg_list || !msg_banner) return
          const tracks = player.queue;
          const maxTracks = 10; //tracks / Queue Page
          const songs = tracks.slice(0, maxTracks);
          if (guild.iconURL()) {
            console.log(
              songs
                .map(
                  (track, index) =>
                    `**\` ${++index}. \` ${track.uri
                      ? `[${track.title
                        .substring(0, 60)
                        .replace(/\[/giu, '\\[')
                        .replace(/\]/giu, '\\]')}](${track.uri})`
                      : track.title
                    }** - \`${track.isStream ? `LIVE STREAM` : format(track.duration).split(` | `)[0]
                    }\`\n> 신청자: __${(track.requester as any).tag}__`,
                )
                .join(`\n`)
                .substring(0, 2000),
            );
            const ss = new Embed(client, 'info')
              .setAuthor({
                name: '재생 중인 노래',
                iconURL:
                  'https://images-ext-1.discordapp.net/external/n83quR20ZzWm4y8bO4lnFUWouP0c4rtao8TbXckuvTc/%3Fv%3D1/https/cdn.discordapp.com/emojis/667750713698549781.gif',
              })
              .setTitle(`📃 재생목록 __**${guild.name}**__`)
              .setThumbnail(guild.iconURL())
              .setColor('#2f3136')
              .addFields(
                {
                  name: `**\` N. \` *${player.queue.length > maxTracks
                    ? player.queue.length - maxTracks
                    : player.queue.length
                    } 개의 노래가 대기중 ...***`,
                  value: `\u200b`,
                },
                {
                  name: `**\` 0. \` __재생중인 노래__**`,
                  value: `**${player.queue.current?.uri
                    ? `[${player.queue.current.title
                      .substring(0, 60)
                      .replace(/\[/giu, '\\[')
                      .replace(/\]/giu, '\\]')}](${player.queue.current.uri})`
                    : player.queue.current?.title
                    }** - \`${player.queue.current?.isStream
                      ? `LIVE STREAM`
                      : format(player.queue.current?.duration!).split(` | `)[0]
                    }\`\n> 신청자: __${(player.queue.current?.requester as any).tag}__`,
                },
              )
              .setDescription(
                String(
                  songs
                    .map(
                      (track, index) =>
                        `**\` ${++index}. \` ${track.uri
                          ? `[${track.title
                            .substring(0, 60)
                            .replace(/\[/giu, '\\[')
                            .replace(/\]/giu, '\\]')}](${track.uri})`
                          : track.title
                        }** - \`${track.isStream ? `LIVE STREAM` : format(track.duration).split(` | `)[0]
                        }\`\n> 신청자: __${(track.requester as any).tag}__`,
                    )
                    .join(`\n`),
                ).substring(0, 2000).length
                  ? String(
                    songs
                      .map(
                        (track, index) =>
                          `**\` ${++index}. \` ${track.uri
                            ? `[${track.title
                              .substring(0, 60)
                              .replace(/\[/giu, '\\[')
                              .replace(/\]/giu, '\\]')}](${track.uri})`
                            : track.title
                          }** - \`${track.isStream
                            ? `LIVE STREAM`
                            : format(track.duration).split(` | `)[0]
                          }\`\n> 신청자: __${(track.requester as any).tag}__`,
                      )
                      .join(`\n`),
                  ).substring(0, 2000)
                  : '** **',
              );
            msg_list.edit({ embeds: [ss] });
          }
          if (!guild.iconURL()) {
            const ss = new Embed(client, 'info')
              .setAuthor({
                name: '재생 중인 노래',
                iconURL:
                  'https://images-ext-1.discordapp.net/external/n83quR20ZzWm4y8bO4lnFUWouP0c4rtao8TbXckuvTc/%3Fv%3D1/https/cdn.discordapp.com/emojis/667750713698549781.gif',
              })
              .setTitle(`📃 재생목록 __**${guild.name}**__`)
              .setColor('#2f3136')
              .addFields(
                {
                  name: `**\` N. \` *${player.queue.length > maxTracks
                    ? player.queue.length - maxTracks
                    : player.queue.length
                    } 개의 노래가 대기중 ...***`,
                  value: `\u200b`,
                },
                {
                  name: `**\` 0. \` __재생중인 노래__**`,
                  value: `**${player.queue.current?.uri
                    ? `[${player.queue.current.title
                      .substring(0, 60)
                      .replace(/\[/giu, '\\[')
                      .replace(/\]/giu, '\\]')}](${player.queue.current.uri})`
                    : player.queue.current?.title
                    }** - \`${player.queue.current?.isStream
                      ? `LIVE STREAM`
                      : format(player.queue.current?.duration!).split(` | `)[0]
                    }\`\n> 신청자: __${(player.queue.current?.requester as any).tag}__`,
                },
              )
              .setDescription(
                String(
                  songs
                    .map(
                      (track, index) =>
                        `**\` ${++index}. \` ${track.uri
                          ? `[${track.title
                            .substring(0, 60)
                            .replace(/\[/giu, '\\[')
                            .replace(/\]/giu, '\\]')}](${track.uri})`
                          : track.title
                        }** - \`${track.isStream ? `LIVE STREAM` : format(track.duration).split(` | `)[0]
                        }\`\n> 신청자: __${(track.requester as any).tag}__`,
                    )
                    .join(`\n`),
                ).substring(0, 2000),
              );
            msg_list.edit({ embeds: [ss] });
          }

          const embed = new Embed(client, 'info');
          if (guild.iconURL()) {
            embed
              .setColor('#2f3136')
              .setTitle('지금 재생중인 노래')
              .addFields(
                {
                  name: `재생시간`,
                  value: `\`${format(player.queue.current?.duration!).split(' | ')[0]}\``,
                  inline: true,
                },
                { name: `제작자`, value: `\`${player.queue.current?.author}\``, inline: true },
                { name: `남은곡`, value: `\`${player.queue.length} 개\``, inline: true },
              )
              .setFooter({ text: gdname, iconURL: gdicon! })
              .setImage(
                `https://img.youtube.com/vi/${player.queue.current?.identifier}/mqdefault.jpg`,
              );
          }
          if (!guild.iconURL()) {
            embed
              .setColor('#2f3136')
              .setTitle('지금 재생중인 노래')
              .addFields(
                {
                  name: `재생시간`,
                  value: `\`${format(player.queue.current?.duration!).split(' | ')[0]}\``,
                  inline: true,
                },
                { name: `제작자`, value: `\`${player.queue.current?.author}\``, inline: true },
                { name: `남은곡`, value: `\`${player.queue.length} 개\``, inline: true },
              )
              .setFooter({ text: gdname })
              .setImage(
                `https://img.youtube.com/vi/${player.queue.current?.identifier}/mqdefault.jpg`,
              );
          }
          return void (await msg_banner.edit({
            embeds: [embed],
            components: [vaset],
          }));
        }
      })
      .on('queueEnd', async (player, _track) => {
        const channel = client.channels.cache.get(player.textChannel!) as TextBasedChannel;
        if (!channel) return
        const playl = new Embed(client, 'info').setTitle('끝!').setDescription(`노래가 끝났어요!`);
        channel.send({ embeds: [playl] }).then((message) => {
          if (!message) return;
          setTimeout(async () => {
            try {
              await message.delete()
            } catch (e) {
              console.log(e)
            }
          }, 5000);
        });;
        const guild = await client.guilds.fetch(player.guild);
        const find = await MusicSetting.findOne({ guildid: guild.id });
        if (find) {
          const chid = find.channel_id;
          const msgid_list = find.messageid_list;
          const msgid_banner = find.messageid_banner;
          const channel = client.channels.cache.get(chid) as TextBasedChannel;
          const msg_list = await channel.messages.fetch(msgid_list);
          const msg_banner = await channel.messages.fetch(msgid_banner);
          if (!msg_list || !msg_banner) return
          const ss = new Embed(client, 'info')
            .setAuthor({
              name: `**재생 중인 노래**`,
              iconURL: `https://images-ext-1.discordapp.net/external/n83quR20ZzWm4y8bO4lnFUWouP0c4rtao8TbXckuvTc/%3Fv%3D1/https/cdn.discordapp.com/emojis/667750713698549781.gif`,
            })
            .setTitle(`📃 재생목록 __**${guild.name}**__`)
            .setThumbnail(guild.iconURL() ? guild.iconURL() : null)
            .setColor('#2f3136')
            .setDescription(`대기중인 노래가 없습니다.`);
          const gg = new Embed(client, 'default')
            .setTitle('재생중인 노래가 없어요')
            .setColor('#2f3136')
            .setDescription(
              `❌ **노래가 재생 중이지 않아요!\n해당 채널에 노래 제목을 입력해주세요!**\n[대시보드](https://battlebot.kr/) | [서포트 서버](https://discord.gg/WtGq7D7BZm) | [상태](https://battlebot.kr/status)`,
            )
            .setImage(
              'https://media.discordapp.net/attachments/901745892418256910/941301364095586354/46144c4d9e1cf2e6.png?width=1155&height=657',
            );
          msg_list.edit({ embeds: [ss] });
          msg_banner.edit({ embeds: [gg], components: [] });
        }
      });

    logger.info(`Logged ${client.user?.username}`);
  },
  { once: true },
);
async function StatusUpdate(client: BotClient) {
  const totalShard = client.shard?.count;
  const shardInfo = await ShardInfo(client);
  const status = new Status();
  status.build_number = client.BUILD_NUMBER!;
  (status.commands = String(client.commands.size)), (status.totalShard = String(totalShard));
  // @ts-ignore
  status.shard = shardInfo;
  status.save((err: any) => {
    if (err) logger.error(`봇 상태 업데이트 오류: ${err}`);
  });
  logger.info('봇 상태 업데이트');
}

async function PremiumAlert(client: BotClient) {
  const PremiumDB = await Premium.find({});
  PremiumDB.forEach((guild) => {
    const premiumguild = client.guilds.cache.get(guild.guild_id);
    if (!premiumguild) return;
    const user = client.users.cache.get(premiumguild.ownerId);
    if (!user) return;
    const embed = new Embed(client, 'info');
    embed.setTitle(`${client.user?.username} 프리미엄`);
    const now = new Date();
    const lastDate = Math.round((Number(guild.nextpay_date) - Number(now)) / 1000 / 60 / 60 / 24);
    if (lastDate === 7) {
      embed.setDescription(
        `${premiumguild.name} 서버의 프리미엄 만료일이 7일 (${DateFormatting._format(
          guild.nextpay_date,
        )}) 남았습니다`,
      );
      return user.send({ embeds: [embed] });
    }
    if (lastDate === 1) {
      embed.setDescription(
        `${premiumguild.name} 서버의 프리미엄 만료일이 1일 (${DateFormatting._format(
          guild.nextpay_date,
        )}) 남았습니다`,
      );
      return user.send({ embeds: [embed] });
    }
    if (lastDate === 0) {
      embed.setDescription(`${premiumguild.name} 서버의 프리미엄이 만료되었습니다`);
      return user.send({ embeds: [embed] });
    }
  });
}

async function PremiumPersonAlert(client: BotClient) {
  const PremiumDB = await PremiumUser.find({});
  PremiumDB.forEach((user) => {
    const users = client.users.cache.get(user.user_id);
    if (!users) return;
    const embed = new Embed(client, 'info');
    embed.setTitle(`${client.user?.username} 프리미엄`);
    const now = new Date();
    const lastDate = Math.round((Number(user.nextpay_date) - Number(now)) / 1000 / 60 / 60 / 24);
    try {
      if (lastDate === 7) {
        embed.setDescription(
          `${users.username}님의 프리미엄 만료일이 7일 (${DateFormatting._format(
            user.nextpay_date,
          )}) 남았습니다`,
        );
        return users.send({ embeds: [embed] });
      }
      if (lastDate === 1) {
        embed.setDescription(
          `${users.username} 서버의 프리미엄 만료일이 1일 (${DateFormatting._format(
            user.nextpay_date,
          )}) 남았습니다`,
        );
        return users.send({ embeds: [embed] });
      }
      if (lastDate === 0) {
        embed.setDescription(`${users.username} 서버의 프리미엄이 만료되었습니다`);
        return users.send({ embeds: [embed] });
      }
    } catch (e) {
      logger.error(e as unknown as string);
    }
  });
}

async function ShardInfo(client: BotClient) {
  const shardInfo = [];
  const totalShard = client.shard?.count as number;
  const wsping = (await client.shard?.fetchClientValues('ws.ping')) as number[];
  const guilds = (await client.shard?.fetchClientValues('guilds.cache.size')) as number[];
  const users = (await client.shard?.fetchClientValues('users.cache.size')) as number[];
  const channels = (await client.shard?.fetchClientValues('channels.cache.size')) as number[];
  const uptime = (await client.shard?.fetchClientValues('uptime')) as number[];

  for (let i = 0; i < totalShard; i++) {
    shardInfo.push({
      shardNumber: i,
      shardPing: wsping[i],
      shardGuild: guilds[i],
      shardMember: users[i],
      shardChannels: channels[i],
      shardUptime: uptime[i],
    });
  }
  return shardInfo;
}

async function automodResetChannel(client: BotClient) {
  const automod = await Automod.find();
  automod.forEach(async ({ useing, guild_id }) => {
    if (!useing.useResetChannel) return;
    if (!useing.useResetChannels || useing.useResetChannels.length === 0) return;
    const guild = client.guilds.cache.get(guild_id);
    if (!guild) return;
    const newChannels: string[] = [];
    for await (const resetchannel of useing.useResetChannels) {
      const channel = guild?.channels.cache.get(resetchannel) as GuildChannel;
      if (!channel) return;
      const newchannel = await guild?.channels.create({
        name: channel.name,
        type: ChannelType.GuildText,
        parent: channel.parent ? channel.parent.id : undefined,
        permissionOverwrites: channel.permissionOverwrites.cache,
        position: channel.position,
      });
      if (!newchannel) return;
      await newchannel.send({
        embeds: [
          new Embed(client, 'info')
            .setTitle('채널 초기화')
            .setDescription('채널 초기화가 완료되었습니다.'),
        ],
      });
      await channel.delete();
      newChannels.push(newchannel.id);
    }
    return await Automod.updateOne(
      { guild_id: guild_id },
      { $set: { 'useing.useResetChannels': newChannels } },
    );
  });
}

async function nftChecker(client: BotClient) {
  const wallet_list = await NFTUserWallet.find();
  const guild_list = await NFTGuildVerify.find();
  wallet_list.forEach(async (user_wallet) => {
    await axios
      .get(`https://th-api.klaytnapi.com/v2/account/${user_wallet.wallet_address}/token?kind=nft`, {
        headers: {
          Authorization: 'Basic ' + config.klaytnapikey,
          'X-Chain-ID': '8217',
        },
      })
      .then((data) => {
        guild_list.forEach(async (guild_data) => {
          const result = data.data.items.filter(
            (x: any) => x.contractAddress === guild_data.wallet,
          );
          if (result.length === 0) {
            const guild = client.guilds.cache.get(guild_data.guild_id);
            if (!guild) return;
            const member = guild.members.cache.get(user_wallet.user_id);
            if (!member) return;
            try {
              await member.roles.remove(guild_data.role_id);
            } catch (e) {
              return;
            }
          } else {
            return;
          }
        });
      })
      .catch(() => {
        return;
      });
  });
}

async function ServerCountUpdate(client: BotClient) {
  const res = await client.shard?.fetchClientValues('guilds.cache.size');
  axios
    .post(
      `https://api.archiver.me/bots/${client.user?.id}/server`,
      {
        servers: res?.reduce((acc, guilds) => Number(acc) + Number(guilds), 0),
      },
      {
        headers: { Authorization: 'Bearer ' + config.updateServer.archive },
      },
    )
    .then(() => {
      logger.info('아카이브: 서버 수 업데이트 완료');
    })
    .catch((e: any) => {
      logger.error(`아카이브: 서버 수 업데이트 오류: ${e.response?.data.message}`);
    });

  axios
    .post(
      `https://koreanbots.dev/api/v2/bots/${client.user?.id}/stats`,
      {
        servers: res?.reduce((acc, guilds) => Number(acc) + Number(guilds), 0),
        shards: client.shard?.count,
      },
      {
        headers: { Authorization: config.updateServer.koreanbots },
      },
    )
    .then(() => {
      logger.info('한디리: 서버 수 업데이트 완료');
    })
    .catch((e: any) => {
      logger.error(`한디리: 서버 수 업데이트 오류: ${e.response?.data.message}`);
    });
}
