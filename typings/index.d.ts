import {
  ClientOptions,
  CommandInteraction,
  Message,
  Role,
  ShardingManagerOptions
} from 'discord.js'

export type LevelType =
  | 'fatal'
  | 'error'
  | 'warn'
  | 'info'
  | 'verbose'
  | 'debug'
  | 'chat'

export type EmbedType = 'default' | 'error' | 'success' | 'warn' | 'info'

export interface ErrorReportOptions {
  executer: Message | CommandInteraction | undefined
  isSend?: boolean
}

export interface IConfig {
  BUILD_VERSION: string
  BUILD_NUMBER: string | null
  githubToken?: string
  web?: {
    baseurl: string
  }
  bot: {
    sharding: boolean
    shardingOptions?: ShardingManagerOptions
    options: ClientOptions
    token: string
    owners: string[]
    prefix: string
    cooldown?: number
  }
  report: {
    type: 'webhook' | 'text'
    webhook: {
      url: string
    }
    text: {
      guildID: string
      channelID: string
    }
  }
  database: {
    type: 'mongodb' | 'sqlite'
    url: string
    options: any
  }
  logger: {
    level: LevelType
    dev: boolean
  }
  email: {
    Google_Email: string
    Google_Client_Id: string
    Google_Client_Secret: string
    Google_Redirect_Url: string
    Google_Refresh_Token: string
  }
}

export interface logger {
  memberJoin?: boolean
  memberLeft?: boolean
  memberKick?: boolean
  memberBan?: boolean
  deleteMessage?: boolean
  editMessage?: boolean
  reactMessage?: boolean
  createChannel?: boolean
  deleteChannel?: boolean
  editChannel?: boolean
  joinVoiceChannel?: boolean
  leaveVoiceChannel?: boolean
  inviteGuild?: boolean
  serverSetting?: boolean
  eventCreate?: boolean
  eventEdit?: boolean
  eventDelete?: boolean
  memberUpdate?: boolean
}

export interface loggerDB {
  _id: mongoTypes.ObjectId
  guild_id: string
  guild_channel_id: string
  useing: logger
  published_date: Date
}

export interface VerifySettingDB {
  guild_id: string
  role_id: string
  type: verifyType
  published_date: Date
}

export interface VerifyDB {
  guild_id: string
  user_id: string
  token: string
  status: verifyStatusType
  published_date: Date
}

export interface AutoModDB {
  guild_id: string;
  useing: AutoModList;
  published_date: Date;
}

export interface AutoModList {
  useUrl?: boolean;
  useCurse?: boolean;
  useBlackList?: boolean;
  useCreateAt?: number;
  useAutoRole?: boolean
  autoRoleId?: string
  useCurseType?: useCurseType
  role?: Role
  useCurseIgnoreChannel?: string[]
}
export interface DataBaseUser { 
  _id: string;
  id: string;
  email: string;
  accessToken: string;
  refreshToken: string;
  naver_accessToken?: string;
  naver_refreshToken?: string;
  naver_email?: string;
  naver_name?: string;
  google_accessToken?: string;
  google_refreshToken?: string;
  token: string;
  tokenExp: number;
  expires_in: number;
  published_date: Date;

}

export interface SchoolDataResponse {
  error: boolean
  schools: School[]
}
export interface School {
  code: string
  scCode: string
  name: string
  where: string
  site: string
}

export interface SchoolMealResponse {
  error: boolean
  meals: Meals[]
}

export interface Meals {
  date: string
  type: string
  meal: string[]
  calories: string
}

export interface AutoTaskRoleDB {
  published_date: Date;
  token: string;
  message_id: string;
  isKeep:boolean;
  guild_id: string;
}

export interface YoutubeChannels {
  kind: string
  etag: string
  pageInfo: {
    totalResults: number
    resultsPerPage: number
  }
  items: YoutubeChannel[]
}
export interface YoutubeChannel {
  kind: string;
  etag: string;
  id: string;
  snippet: {
    title: string;
    description: string;
    resourceId: ResourceId;
    channelId: string;
  };
}
export interface ResourceId {
  kind: string;
  channelId: string;
}
export type verifyType = 'email' | 'captcha' | 'naver' |'default'
export type verifyStatusType = 'success' | 'pending'
export type useCurseType = 'delete' | 'delete_kick' | 'delete_ban'
