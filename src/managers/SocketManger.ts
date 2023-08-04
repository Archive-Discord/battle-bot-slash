import { Socket, io } from 'socket.io-client'
import Logger from "../utils/Logger";
import BaseManager from "./BaseManager";
import config from '../../config';
import { SOCKET_ACTIONS } from '../utils/Utils';
import BotClient from '../structures/BotClient';
import { MessageData, SOCKET_ACTION_DATA } from '../../typings/socket';
import { verifyGenerator } from '../buttons/verify/verify';
import { verifyType } from '../../typings';
import Embed from '../utils/Embed';
import { guildProfileLink } from '../utils/convert';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

/**
 * @extends {BaseManager}
 */
export default class SocketManger extends BaseManager {
  private logger = new Logger('SocketManager')
  public socket!: Socket
  public isConnected = false

  constructor(client: BotClient) {
    super(client)

    this.load()
  }

  public async load() {
    this.logger.debug('Loading socket...')

    const socket = io(config.websocket.url + '/client', {
      auth: {
        token: config.bot.token
      },
    })

    this.socket = socket

    this.socket.on('connect', () => {
      this.isConnected = true
      this.logger.info('BattleBot Event Gateway 서버에 연결되었습니다.')
    })

    this.socket.on('connect_error', (error) => {
      this.logger.error('BattleBot Event Gateway 서버에 연결할 수 없습니다.')

      this.logger.error(error.message)
    })

    this.socket.on('disconnect', () => {
      this.onDisconnect()
    })

    this.listener()
  }

  public async emit(event: SOCKET_ACTIONS, ...args: any[]) {
    this.socket.emit(event, ...args)
  }

  public async sendMessage(guildId: string, data: MessageData) {
    this.socket.emit(SOCKET_ACTIONS.SEND_MESSAGE, {
      guildId,
      ...data
    })
  }

  public async reconnect() {
    this.socket.connect()
    this.isConnected = true
  }

  public async disconnect() {
    this.socket.disconnect()
    this.isConnected = false
  }

  public async getSocket() {
    if (!this.socket.connected) await this.reconnect()

    return this.socket
  }

  private async onDisconnect() {
    this.logger.warn(
      'BattleBot Event Gateway 서버와 연결이 끊어졌습니다. 재연결을 시도합니다...'
    )

    try {
      if (!this.socket) {
        await this.reconnect()
      }
    } catch (error) {
      this.logger.error('BattleBot Event Gateway 서버에 재연결에 실패했습니다.')
    }

    this.logger.info('BattleBot Event Gateway 서버에 재연결에 성공했습니다.')
  }

  private async listener() {
    this.socket.onAny(async (event: SOCKET_ACTIONS, data) => {
      this.logger.debug(`${event} ${JSON.stringify(data)}`)
    })

    this.socket.on(
      SOCKET_ACTIONS.VERIFY_GENERATE, async (data: SOCKET_ACTION_DATA<SOCKET_ACTIONS.VERIFY_GENERATE>) => {
        const guild = this.client.guilds.cache.get(data.guildId)
        const user = this.client.users.cache.get(data.userId)
        if (!guild || !user) return
        const url = await verifyGenerator(this.client, data.type as verifyType, data.guildId, data.userId, data.role, data.deleteRole)

        const captchaGuildEmbed = new Embed(this.client, 'info').setColor('#2f3136')
          .setThumbnail(guildProfileLink(guild))
          .setTitle(`${guild.name} 서버 인증`)
          .setDescription(
            `${guild.name}서버의 인증을 진행하시려면 아래 버튼을 눌러주세요\n\n디스코드가 멈출경우 [여기](${config.web.baseurl}/verify?token=${url.token})를 눌러 진행해주세요`
          )
          .setURL(`https://discord.com/channels/${guild.id}/${data.channelId}`);

        const verifyButton = new ButtonBuilder()
          .setStyle(ButtonStyle.Link)
          .setLabel('인증하기')
          .setURL(url.loginUri)
          .setEmoji('✅')

        const row = new ActionRowBuilder<ButtonBuilder>()
          .addComponents(verifyButton)

        this.emit(SOCKET_ACTIONS.VERIFY_REPLY, {
          guildId: data.guildId,
          interactionId: data.interactionId,
          component: row.toJSON(),
          embed: captchaGuildEmbed.toJSON()
        } as SOCKET_ACTION_DATA<SOCKET_ACTIONS.VERIFY_REPLY>)
      })
  }
}