import {
  ClientOptions,
  CommandInteraction,
  Message,
  Role,
  ShardingManagerOptions
} from 'discord.js'
import { Request } from 'express'
import BotClient from '../src/structures/BotClient'
import { type } from 'os'

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
  pubgapikey: string
  klaytnapikey: string
  web: {
    baseurl: string
  }
  updateServer: {
    koreanbots: string
    archive: string
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

  guildAddAlert: {
    guildID: string
    channelID: string
  }
  devGuild: {
    guildID: string
    channelID: string
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
  del_role_id: string
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
  guild_id: string
  useing: AutoModList
  published_date: Date
}

export interface HcsDB {
  user_id: string
  school: string
  birthday: string
  schoolEndponints: string
  password: string
  name: string
  published_date: Date
}

export interface AutoModList {
  useUrl?: boolean
  useCurse?: boolean
  useBlackList?: boolean
  useCreateAt?: number
  useAutoRole?: boolean
  autoRoleId?: string
  useCurseType?: useCurseType
  role?: Role
  useCurseIgnoreChannel?: string[]
  useResetChannel?: boolean
  useResetChannels?: string[]
}
export interface DataBaseUser {
  _id: string
  id: string
  email: string
  accessToken: string
  refreshToken: string
  kakao_accessToken?: string
  kakao_refreshToken?: string
  kakao_email?: string
  kakao_name?: string
  google_accessToken?: string
  google_refreshToken?: string
  token: string
  tokenExp: number
  expires_in: number
  published_date: Date
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
export interface MusicDB {
  guild_id: string
  channel_id: string
  message_id: string
  process_message_id: string
  published_date: Date
}

export interface AutoTaskRoleDB {
  published_date: Date
  token: string
  message_id: string
  isKeep: boolean
  guild_id: string
}

export interface PubgDB {
  published_date: Date
  last_update: Date
  user_id: string
  nickname: string
  platform: pubgPlatformeType
  stats: {
    rankSoloTpp: RankedGameModeStats
    rankSoloFpp: RankedGameModeStats
    rankSquardTpp: RankedGameModeStats
    rankSquardFpp: RankedGameModeStats
    soloFpp: GameModeStat
    soloTpp: GameModeStat
    duoFpp: GameModeStat
    duoTpp: GameModeStat
    SquardFpp: GameModeStat
    SquardTpp: GameModeStat
  }
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
  kind: string
  etag: string
  id: string
  snippet: {
    title: string
    description: string
    resourceId: ResourceId
    channelId: string
  }
}
export interface ResourceId {
  kind: string
  channelId: string
}

export interface PremiumDB {
  guild_id: string
  nextpay_date: Date
  published_date: Date
}

export interface PremiumUserDB {
  user_id: string
  nextpay_date: Date
  published_date: Date
}

export interface GameModeStat {
  assists: number
  boosts: number
  dailyKills: number
  dailyWins: number
  damageDealt: number
  days: number
  dBNOs: number
  headshotKills: number
  heals: number
  killPoints: number
  kills: number
  longestKill: number
  longestTimeSurvived: number
  losses: number
  maxKillStreaks: number
  mostSurvivalTime: number
  rankPoints: number
  rankPointsTitle: string
  revives: number
  rideDistance: number
  roadKills: number
  roundMostKills: number
  roundsPlayed: number
  suicides: number
  swimDistance: number
  teamKills: number
  timeSurvived: number
  top10s: number
  vehicleDestroys: number
  walkDistance: number
  weaponsAcquired: 12
  weeklyKills: number
  weeklyWins: number
  winPoints: number
  wins: number
}
export interface RankedGameModeStats {
  assists: number
  avgRank: number
  avgSurvivalTime: number
  bestRankPoint: number
  bestTier: {
    tier: string
    subTier: string
  }
  boosts: number
  currentRankPoint: number
  currentTier: {
    tier: string
    subTier: string
  }
  dBNOs: number
  damageDealt: number
  deaths: number
  headshotKillRatio: number
  headshotKills: number
  heals: number
  kda: number
  kdr: number
  killStreak: number
  kills: number
  longestKill: number
  playTime: number
  reviveRatio: number
  revives: number
  roundMostKills: number
  roundsPlayed: number
  teamKills: number
  top10Ratio: number
  weaponsAcquired: number
  winRatio: number
  wins: number
}

export interface nftVerifyUserDB {
  guild_id: string
  user_id: string
  token: string
  process: string
  published_date: Date
}

export interface LevelDB {
  user_id: string
  guild_id: string
  currentXP: number
  level: number
  totalXP: number
  published_date: Date
}

export interface VoteItem {
  item_id: string
  item_name: string
  vote: number
  voted: [string]
}

export interface VoteDB {
  published_date: Date
  guild_id: string
  message_id: string
  vote_items: VoteItem[]
  status: voteStatus
}

export interface LevelGuildDB {
  guild_id: string
  useage: boolean
  published_date: Date
}

export type verifyType = 'email' | 'captcha' | 'kakao' | 'default'
export type verifyStatusType = 'success' | 'pending'
export type useCurseType = 'delete' | 'delete_kick' | 'delete_ban'
export type pubgPlatformeType = 'steam' | 'kakao'
export type voteStatus = 'open' | 'close'
