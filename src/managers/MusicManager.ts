import BaseManager from './BaseManager'
import BotClient from '../structures/BotClient'
import Logger from '../utils/Logger'
import { LavalinkManager } from 'lavalink-client'
import { requesterTransformer } from '../utils/music/utils.music'
import { NodesEvents, PlayerEvents } from '../utils/music/events.music'
import { MusicStore } from '../utils/redis/music.store'

export default class MusicManager extends BaseManager {
  private logger: Logger
  public music: LavalinkManager

  constructor(client: BotClient) {
    super(client)
    this.logger = new Logger('MusicManager')
    this.music = new LavalinkManager({
      nodes: client.config.music,
      sendToShard: (guildId, payload) => client.guilds.cache.get(guildId)?.shard?.send(payload),
      autoSkip: true,
      playerOptions: {
        applyVolumeAsFilter: false,
        clientBasedPositionUpdateInterval: 50, // in ms to up-calc player.position
        defaultSearchPlatform: "ytmsearch",
        volumeDecrementer: 0.75, // on client 100% == on lavalink 75%
        requesterTransformer: requesterTransformer,
        onDisconnect: {
          autoReconnect: true, // automatically attempts a reconnect, if the bot disconnects from the voice channel, if it fails, it get's destroyed
          destroyPlayer: false // overrides autoReconnect and directly destroys the player if the bot disconnects from the vc
        },
        onEmptyQueue: {
          destroyAfterMs: 30_000, // 0 === instantly destroy | don't provide the option, to don't destroy the player
        },

        useUnresolvedData: true
      },
      queueOptions: {
        maxPreviousTracks: 10,
        queueStore: new MusicStore(client.redisClient),
      },
    })

    this.load()
  }

  public load() {
    this.logger.log('Loading music manager...')
    this.client.lavalink = this.music;
    NodesEvents(this.client)
    PlayerEvents(this.client)
  }

  public async init() {
    this.logger.log('Initializing music manager...')

    await this.music.init({
      id: this.client.user?.id as string,
      username: 'BattleMusic',
    })

    this.logger.log('Connected to Lavalink')
  }
}