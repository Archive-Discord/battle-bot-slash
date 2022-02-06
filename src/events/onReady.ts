import Status from 'src/schemas/statusSchema'
import BotClient from 'src/structures/BotClient'
import { Event } from '../structures/Event'
import Logger from '../utils/Logger'

const logger = new Logger('bot')

export default new Event(
  'ready',
  async (client) => {
    setInterval(async () => {
      StatusUpdate(client)
    }, 60 * 1000 * 5)
    logger.info(`Logged ${client.user?.username}`)
  },
  { once: true }
)

async function StatusUpdate(client: BotClient) {
  let totalShard = client.shard?.count
  let shardInfo = await ShardInfo(client)
  let status = new Status()
  status.build_number = client.BUILD_NUMBER
  status.commands = client.commands.size,
    status.totalShard = totalShard
  status.shard = shardInfo
  status.save((err: any) => {
    if (err) logger.error(`봇 상테 업데이트 오류: ${err}`)
  })
  logger.info('봇 상테 업데이트')
}

async function ShardInfo(client: BotClient) {
  let shardInfo = new Array()
  let totalShard = client.shard?.count as number
  let wsping = await client.shard?.fetchClientValues('ws.ping') as number[]
  let guilds = await client.shard?.fetchClientValues('guilds.cache.size') as number[]
  let users = await client.shard?.fetchClientValues('users.cache.size') as number[]
  let channels = await client.shard?.fetchClientValues('channels.cache.size') as number[]
  let uptime = await client.shard?.fetchClientValues('uptime') as number[]

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