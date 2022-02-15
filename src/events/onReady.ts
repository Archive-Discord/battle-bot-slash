import Status from '../schemas/statusSchema'
import BotClient from '../structures/BotClient'
import { Event } from '../structures/Event'
import Logger from '../utils/Logger'
import Premium from '../schemas/premiumSchemas'
import Embed from '../utils/Embed'
import schedule from "node-schedule"
import DateFormatting from '../utils/DateFormatting'

const logger = new Logger('bot')

export default new Event(
  'ready',
  async (client) => {
    setInterval(async () => {
      StatusUpdate(client)
    }, 60 * 1000 * 5)
    //schedule.scheduleJob('0 0 12 * * *', () => {
    //  PremiumAlert(client)
    //});
    setInterval(async () => {
      PremiumAlert(client)
    }, 5000)
    logger.info(`Logged ${client.user?.username}`)
  },
  { once: true }
)

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
