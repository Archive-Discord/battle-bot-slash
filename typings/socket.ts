import { APIActionRowComponent, APIEmbed, APIMessageActionRowComponent } from 'discord.js';
import { SOCKET_ACTIONS } from "../src/utils/Utils";

export interface Custombot {
  _id: string;
  guildId: string;
  token: string;
  prefix: string;
  useage: boolean;
  containerId: string;
  clusterId: string;
  published_date: Date;
}

export interface GreedingData {
  userId: string;
  guildId: string;
  channelId: string;
  embed: APIEmbed;
  type: 'guild' | 'dm';
}

export interface LogData {
  guildId: string
  channelId: string
  embed: APIEmbed
}

export interface MessageData {
  channelId: string
  embed?: APIEmbed
  content?: string
  components?: APIActionRowComponent<APIMessageActionRowComponent>
  type: 'guild' | 'dm'
}

export interface GenerateVerify {
  interactionId: string;
  guildId: string;
  channelId: string;
  userId: string;
  type: string;
  role: string;
  deleteRole?: string;
}

export interface ReplyVerify {
  guildId: string
  interactionId: string
  embed: APIEmbed
  component: APIActionRowComponent<APIMessageActionRowComponent>
}

export interface BasedMusic {
  guildId: string
  excutorId: string
}

export interface MusicStart extends BasedMusic {
  url: string
}

export type SOCKET_ACTIONS_DATA = {
  [SOCKET_ACTIONS.PING]: undefined;
  [SOCKET_ACTIONS.PONG]: undefined;
  [SOCKET_ACTIONS.SEND_WELCOME_MESSAGE]: GreedingData;
  [SOCKET_ACTIONS.SEND_OUTTING_MESSAGE]: GreedingData;
  [SOCKET_ACTIONS.SEND_MESSAGE]: MessageData;
  [SOCKET_ACTIONS.VERIFY_GENERATE]: GenerateVerify;
  [SOCKET_ACTIONS.VERIFY_REPLY]: ReplyVerify;
};

export type SOCKET_ACTION_DATA<T extends keyof SOCKET_ACTIONS_DATA> = SOCKET_ACTIONS_DATA[T];


