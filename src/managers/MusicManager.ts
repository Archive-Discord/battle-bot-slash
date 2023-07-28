import { Manager } from 'erela.js'
import BaseManager from './BaseManager'
import BotClient from '../structures/BotClient'
import Embed from '../utils/Embed'
import Logger from '../utils/Logger'
import { channelMention, TextChannel } from 'discord.js'
import { format, status, stop } from '../utils/Utils'

export default class MusicManager extends BaseManager {
  private logger: Logger
  public music: Manager

  constructor(client: BotClient) {
    super(client)

    this.logger = new Logger('MusicManager')
    this.music = new Manager({
      nodes: client.config.music,
      send: (id, payload) => {
        const guild = client.guilds.cache.get(id)
        if (guild) guild.shard.send(payload)
      },
      shards: client.options.shardCount || 1,
      clientName: `battlebot`,
      clientId: client.user?.id,
    })
  }

  public load() {
    this.logger.log('Connecting to lavalink nodes...')
    this.music.init(this.client.user?.id, {
      // @ts-ignore
      shards: this.client.ws.totalShards as number,
      clientName: `bot` as string,
      clientId: this.client.user?.id as string,
    })

    this.music
      .on('nodeConnect', async (node) => {
        this.logger.log(`Node "${node.options.identifier}" connected.`)
      })
      .on('nodeReconnect', async (node) => {
        this.logger.info(`The Node: ${node.options.identifier} on host: ${node.options.host} is now attempting a reconnect`)
      })
      .on('nodeDisconnect', async (node) => {
        this.logger.warn(`Connection of the Node: ${node.options.identifier} on host: ${node.options.host}, disconnected`)
      })
      .on('nodeError', async (node, error) => {
        this.logger.error(`Node: ${node.options.identifier} on host: ${node.options.host} errored:`, error)
      })
      .on('trackStart', async (player, track) => {
        status(player.guild, this.client)
        if (!player.textChannel) return
        const channel = this.client.channels.cache.get(player.textChannel) as TextChannel;
        if (!channel?.isTextBased()) return
        const playl = new Embed(this.client, 'success')
          .setTitle("🎶 노래를 재생합니다! 🎶")
          .setURL(`${track.uri}`)
          .setDescription(`\`${track.title}\`` + `(이)가 지금 재생되고 있습니다!`)
          .setFields(
            { name: `길이`, value: `\`${format(track.duration).split(" | ")[0]}\` | \`${format(track.duration).split(" | ")[1]}\``, inline: true },
            { name: `게시자`, value: `${track.author}`, inline: true },
          )
        if (track?.thumbnail) playl.setThumbnail(`${track?.thumbnail}`)
        await channel.send({ embeds: [playl] }).then((m) => {
          setTimeout(() => {
            m.delete()
          }, 15000)
        })
      })
      .on('queueEnd', async (player) => {
        player.destroy()
        if (player?.guild) await this.client.musics.players.delete(player.guild);
        if (!player.textChannel) return
        const channel = this.client.channels.cache.get(player.textChannel)
        stop(player.guild, this.client)
        if (!channel?.isTextBased()) return
        await channel.send({
          embeds: [
            new Embed(this.client, 'info')
              .setTitle("끝!")
              .setDescription(`노래가 끝났어요!`)
          ]
        }).then((m) => {
          setTimeout(() => {
            m.delete()
          }, 15000)
        })
      })
      .on('playerMove', (player, initChannel, newChannel) => {
        if (player.voiceChannel === newChannel) return
        player.voiceChannel = newChannel
        if (player.paused) return
        setTimeout(() => {
          player.pause(true)
          setTimeout(() => player.pause(false), 150)
        }, 150)
      })
      .on('playerDisconnect', async (player, oldChannel) => {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        const channel = await this.client.channels.fetch(player?.textChannel!).catch(() => { })
        if (!channel?.isTextBased()) return

        channel.send({
          embeds: [
            new Embed(this.client, 'warn')
              .setDescription(`${channelMention(oldChannel)} 채널과 연결이 끊겨 재생을 정지합니다!`)
          ]
        }).then((m) => {
          setTimeout(() => {
            m.delete()
          }, 15000)
        })
        return player?.destroy()
      })

    this.client.on('raw', (data) => {
      // @ts-ignore
      switch (data.t) {
        case 'VOICE_SERVER_UPDATE':
        case 'VOICE_STATE_UPDATE':
          this.music.updateVoiceState(data.d)
          break
      }
    })
  }
}