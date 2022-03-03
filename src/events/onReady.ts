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
import config from "../../config"
import progressbar from "string-progressbar"

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
    client.player.on('trackAdd', async(queue, track) => {
      const musicDB = await MusicSetting.findOne({guild_id: queue.guild.id}) as MusicDB
      MusicTrackEvent(client, queue, musicDB)
    })
    client.player.on('tracksAdd', async(queue, track) => {
      const musicDB = await MusicSetting.findOne({guild_id: queue.guild.id}) as MusicDB
      MusicTrackEvent(client, queue, musicDB)
    })
    logger.info(`Logged ${client.user?.username}`)
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

async function MusicTrackStartEvent(client: BotClient, queue: Queue, musicDB: MusicDB) {
  if(!musicDB) return
  const channel = queue.guild.channels.cache.get(musicDB.channel_id) as TextChannel
  if(!channel) return
  let process_message = channel.messages.cache.get(musicDB.process_message_id)
  if(!process_message) process_message = await channel.messages.fetch(musicDB.process_message_id)
  if(!process_message) return
  let processEmbed = new MessageEmbed()
  .setColor('#2f3136')
  let progress = queue.getPlayerTimestamp()
  let current = progress.current.replace(/[^0-9]/g,'');
  let end = progress.end.replace(/[^0-9]/g,'');
  let progressbars = progressbar.splitBar(100, Number(current)/Number(end)*100, 20)
  processEmbed.setDescription("[" + progressbars[0] + "] [" + progress.current + "]")
  process_message.edit({content: " " ,embeds: [processEmbed]})
  const process_Interval = setInterval(() => {
    progress = queue.getPlayerTimestamp()
    current = progress.current?.replace(/[^0-9]/g,'');
    end = progress.end?.replace(/[^0-9]/g,'');
    progressbars = progressbar.splitBar(100, Number(current)/Number(end)*100, 20)
    processEmbed = new MessageEmbed()
      .setColor('#2f3136')
    processEmbed.setDescription("[" + progressbars[0] + "] [" + progress.current + "/" + progress.end + "]")
    if(!process_message) return
    process_message.edit({content: " " ,embeds: [processEmbed]})
    if(Number(current) > Number(end) - 5) {
      clearInterval(process_Interval)
    }
  }, 5000)
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


export { MusicTrackEvent }