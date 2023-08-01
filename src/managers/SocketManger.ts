import { Socket, io } from 'socket.io-client'
import Logger from "../utils/Logger";
import BaseManager from "./BaseManager";
import config from '../../config';
import { SOCKET_ACTIONS } from '../utils/Utils';
import BotClient from '../structures/BotClient';

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
  }

  public async emit(event: SOCKET_ACTIONS, ...args: any[]) {
    this.socket.emit(event, ...args)
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
}