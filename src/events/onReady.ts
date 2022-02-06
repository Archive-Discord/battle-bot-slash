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
  const totalShard = client.shard?.count
  const shardInfo = await ShardInfo(client)
  const status = new Status()
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
  const shardInfo = []
  const totalShard = client.shard?.count as number
  const wsping = await client.shard?.fetchClientValues('ws.ping') as number[]
  const guilds = await client.shard?.fetchClientValues('guilds.cache.size') as number[]
  const users = await client.shard?.fetchClientValues('users.cache.size') as number[]
  const channels = await client.shard?.fetchClientValues('channels.cache.size') as number[]
  const uptime = await client.shard?.fetchClientValues('uptime') as number[]

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