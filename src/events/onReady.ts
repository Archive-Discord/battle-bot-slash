import MusicEmbed from "../utils/MusicEmbed"
import { Queue, Track } from 'discord-player'
import { Message, MessageEmbed, TextChannel } from 'discord.js'
import MusicSetting from '../schemas/musicSchema'
import Status from '../schemas/statusSchema'
import BotClient from '../structures/BotClient'
import { Event } from '../structures/Event'
import Embed from '../utils/Embed'
import Logger from '../utils/Logger'
import { MusicDB } from "../../typings"
import progressbar from "string-progressbar"
import Premium from '../schemas/premiumSchemas'
import schedule from "node-schedule"
import DateFormatting from '../utils/DateFormatting'
import Automod from '../schemas/autoModSchema'
import { Guild, GuildChannel } from 'discord.js'
import NFTUserWallet from '../schemas/NFTUserWalletSchema'
import NFTGuildVerify from '../schemas/NFTGuildVerifySchema'
import axios from 'axios'
import config from '../../config'
import CommandManager from "../managers/CommandManager"
import web from "../server/index"

const logger = new Logger('bot')

export default new Event(
  'ready',
  async (client) => {
    setInterval(async () => {
      StatusUpdate(client)
    }, 60 * 1000 * 5)
    client.player.on('trackStart', async(queue, track) => {
      const musicDB = await MusicSetting.findOne({guild_id: queue.guild.id}) as MusicDB
      MusicAlert(client, track, queue, musicDB)
      MusicTrackEvent(client, queue, musicDB)
      //MusicTrackStartEvent(client, queue, musicDB)
    })
    client.player.on('queueEnd', async(queue) => {
      const musicDB = await MusicSetting.findOne({guild_id: queue.guild.id}) as MusicDB
      MusicQueueEnd(client, queue, musicDB)
    })
    client.player.on('connectionError', async(queue, error) => {
      const musicDB = await MusicSetting.findOne({guild_id: queue.guild.id}) as MusicDB
      MusicQueueEnd(client, queue, musicDB)
    })
    client.player.on('error', async(queue, error) => {
      if(error.name === "DestroyedQueue") {
        const musicDB = await MusicSetting.findOne({guild_id: queue.guild.id}) as MusicDB
        MusicQueueEnd(client, queue, musicDB)
      } else {
        console.log(error)
      }
    })
    client.player.on('botDisconnect', async(queue) => {
      const musicDB = await MusicSetting.findOne({guild_id: queue.guild.id}) as MusicDB
      queue.destroy()
      MusicQueueEnd(client, queue, musicDB)
    })
    client.player.on('trackAdd', async(queue, track) => {
      const musicDB = await MusicSetting.findOne({guild_id: queue.guild.id}) as MusicDB
      MusicTrackEvent(client, queue, musicDB)
    })
    client.player.on('tracksAdd', async(queue, track) => {
      const musicDB = await MusicSetting.findOne({guild_id: queue.guild.id}) as MusicDB
      MusicTrackEvent(client, queue, musicDB)
    })
    schedule.scheduleJob('0 0 0 * * *', () => {
      PremiumAlert(client)
      automodResetChannel(client)
      nftChecker(client)
    });
    logger.info(`Logged ${client.user?.username}`)
    const commandManager = new CommandManager(client)
    await commandManager.slashGlobalCommandSetup()
  },
  { once: true }
)

async function MusicTrackEvent(client: BotClient, queue: Queue, musicDB: MusicDB) {
  if(!musicDB) return
  const channel = queue.guild.channels.cache.get(musicDB.channel_id) as TextChannel
  if(!channel) return
  let message = channel.messages.cache.get(musicDB.message_id)
  if(!message) message = await channel.messages.fetch(musicDB.message_id)
  if(!message) return
  const pageStart = 0
  const pageEnd = pageStart + 5;
  const tracks = queue.tracks.slice(pageStart, pageEnd).map((m, i) => {
    return `**${i + pageStart + 1}**. [${m.title}](${m.url}) ${m.duration} - ${m.requestedBy}`;
  });
  const embed = new MusicEmbed(client, queue.nowPlaying())
  if(tracks.length === 0) {
    embed.setDescription(`
      [대시보드](${config.web?.baseurl}) | [서포트 서버](https://discord.gg/WtGq7D7BZm)
      \n**플레이리스트**\n❌ 더 이상 재생목록에 노래가 없습니다`);
  } else {
    embed.setDescription(`
      [대시보드](${config.web?.baseurl}) | [서포트 서버](https://discord.gg/WtGq7D7BZm)
      \n**플레이리스트**\n${tracks.join('\n')}${
        queue.tracks.length > pageEnd
            ? `\n... + ${queue.tracks.length - pageEnd}`
            : ''
    }`);
  }
  return message.edit({embeds: [embed]})
}

async function MusicQueueEnd(client: BotClient, queue: Queue, musicDB: MusicDB) {
  if(!musicDB) return
  const channel = queue.guild.channels.cache.get(musicDB.channel_id) as TextChannel
  if(!channel) return
  let message = channel.messages.cache.get(musicDB.message_id)
  if(!message) message = await channel.messages.fetch(musicDB.message_id)
  if(!message) return
  const embed = new MusicEmbed(client)
  return message.edit({embeds: [embed]})
}
async function MusicAlert(client: BotClient, track: Track, queue: Queue, musicDB: MusicDB) {
  //@ts-ignore
  const channel = queue.metadata.channel as TextChannel
  if(!musicDB || channel.id !== musicDB.channel_id) {
    const embed = new Embed(client, 'info')
    embed.setAuthor('재생 중인 노래', 'https://cdn.discordapp.com/emojis/667750713698549781.gif?v=1', track.url)
    embed.setDescription(`[**${track.title} - ${track.author}**](${track.url}) ${track.duration} - ${track.requestedBy}`)
    embed.setThumbnail(track.thumbnail)
    return channel.send({embeds: [embed]}).catch(e => {
      if(e) console.log(e)
    })
  }
}
async function StatusUpdate(client: BotClient) {
  const totalShard = client.shard?.count
  const shardInfo = await ShardInfo(client)
  const status = new Status()
  status.build_number = client.BUILD_NUMBER
  ;(status.commands = client.commands.size), (status.totalShard = totalShard)
  status.shard = shardInfo
  status.save((err: any) => {
    if (err) logger.error(`봇 상테 업데이트 오류: ${err}`)
  })
  logger.info('봇 상테 업데이트')
}

async function PremiumAlert(client: BotClient) {
  const PremiumDB = await Premium.find({})
  PremiumDB.forEach((guild) => {
    const premiumguild = client.guilds.cache.get(guild.guild_id)
    if(!premiumguild) return
    const user = client.users.cache.get(premiumguild.ownerId)
    if(!user) return
    const embed = new Embed(client, 'info')
    embed.setTitle(`${client.user?.username} 프리미엄`)
    const now = new Date()
    const lastDate = Math.round((Number(guild.nextpay_date) - Number(now))/ 1000 / 60 / 60 / 24)
    if(lastDate === 7) {
      embed.setDescription(`${premiumguild.name} 서버의 프리미엄 만료일이 7일 (${DateFormatting._format(guild.nextpay_date)}) 남았습니다`)
      return user.send({embeds: [embed]})
    }
    if(lastDate === 1) {
      embed.setDescription(`${premiumguild.name} 서버의 프리미엄 만료일이 1일 (${DateFormatting._format(guild.nextpay_date)}) 남았습니다`)
      return user.send({embeds: [embed]})
    }
    if(lastDate === 0) {
      embed.setDescription(`${premiumguild.name} 서버의 프리미엄이 만료되었습니다`)
      return user.send({embeds: [embed]})
    }
  })
}

async function ShardInfo(client: BotClient) {
  const shardInfo = []
  const totalShard = client.shard?.count as number
  const wsping = (await client.shard?.fetchClientValues('ws.ping')) as number[]
  const guilds = (await client.shard?.fetchClientValues(
    'guilds.cache.size'
  )) as number[]
  const users = (await client.shard?.fetchClientValues(
    'users.cache.size'
  )) as number[]
  const channels = (await client.shard?.fetchClientValues(
    'channels.cache.size'
  )) as number[]
  const uptime = (await client.shard?.fetchClientValues('uptime')) as number[]

  for (let i = 0; i < totalShard; i++) {
    shardInfo.push({
      shardNumber: i,
      shardPing: wsping[i],
      shardGuild: guilds[i],
      shardMember: users[i],
      shardChannels: channels[i],
      shardUptime: uptime[i]
    })
  }
  return shardInfo
}

async function automodResetChannel(client: BotClient) {
  const automod = await Automod.find()
  automod.forEach(async({useing, guild_id}) => {
    if(!useing.useResetChannel) return
    if(!useing.useResetChannels || useing.useResetChannels.length === 0) return
    const guild = client.guilds.cache.get(guild_id)
    if(!guild) return
    const newChannels: string[] = []
    for await (const resetchannel of useing.useResetChannels) {
      const channel = guild?.channels.cache.get(resetchannel) as GuildChannel
      if(!channel) return
      const newchannel = await guild?.channels.create(channel.name, {type: 'GUILD_TEXT', parent: channel.parent ? channel.parent.id : undefined, permissionOverwrites: channel.permissionOverwrites.cache, position: channel.position})
      if(!newchannel) return
      await newchannel.send({embeds: [new Embed(client, 'info').setTitle('채널 초기화').setDescription('채널 초기화가 완료되었습니다.')]})
      await channel.delete()
      newChannels.push(newchannel.id)
    }
    return await Automod.updateOne({guild_id: guild_id}, {$set: {'useing.useResetChannels': newChannels}})
  })
}

async function nftChecker(client: BotClient) {
  const wallet_list = await NFTUserWallet.find()
  const guild_list = await NFTGuildVerify.find()
  wallet_list.forEach(async(user_wallet) => {
    await axios.get(`https://th-api.klaytnapi.com/v2/account/${user_wallet.wallet_address}/token?kind=nft`, {
      headers: {
          "Authorization": "Basic " + config.klaytnapikey,
          "X-Chain-ID": "8217"
      }
    }).then((data) => {
      guild_list.forEach(async(guild_data) => {
        const result = data.data.items.filter((x: any) => x.contractAddress === guild_data.wallet);
        if(result.length === 0) {
          const guild = client.guilds.cache.get(guild_data.guild_id)
          if(!guild) return
          const member = guild.members.cache.get(user_wallet.user_id)
          if(!member) return
          try {
            await member.roles.remove(guild_data.role_id)
          } catch(e) {
            return
          }
        } else {
          return
        }
      })
    }).catch((e) => {
      return
    })
  })
}


export { MusicTrackEvent }
