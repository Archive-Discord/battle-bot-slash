import { ClientOptions, CommandInteraction, ShardingManagerOptions, Message } from "discord.js"

export type Command = {
  name: string
  description?: string
  usage?: string
  aliases: string[]
  isSlash?: boolean
  execute: (client: BotClient, message: Message, args: string[]) => Promise<any>
}
export type Button = {
  // 이건 뭐지;; ㄹㅇ 
}
export type Event = {
  name: string
  once?: boolean
  execute: (client: BotClient, ...args: any[]) => Promise<void>
}

export type LevelType =
  | "fatal"
  | "error"
  | "warn"
  | "info"
  | "verbose"
  | "debug"
  | "chat"

export type EmbedType = 'default' | 'error' | 'success' | 'warn' | 'info'
export interface ErrorExecuter {
  executer: Message | CommandInteraction | undefined
  isSend?: boolean
}
export interface IConfig {
  BUILD_VERSION: string
  BUILD_NUMBER: string | null
  githubToken: string
  web: {
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
    /**
     * @type {'webhook', 'text'}
     */
    type: "webhook" | "text"
    webhook: {
      url: string
    },
    text: {
      guildID: string
      channelID: string
    },
  },
  database: {
    type: "mongodb" | "sqlite"
    url: string
    options: any
  },
  logger: {
    level: LevelType
    dev: boolean
  },
}

export interface GithubCommitAPI {
  sha: string
  commit: {
    author: {
      name: string
      email: string
      date: string
    }
    committer: {
      name: string
      email: string
      date: string
    }
    message: string
    tree: {
      sha: string
      url: string
    }
    url: string
    comment_count: number
    verification: {
      verified: boolean
      reason: string
      signature: null
      payload: null
    }
  }
  url: string
  html_url: string
  comments_url: string
  author: {
    login: string
    id: number
    node_id: string
    avatar_url: string
    gravatar_id: string
    url: string
    html_url: string
    followers_url: string
    following_url: string
    gists_url: string
    starred_url: string
    subscriptions_url: string
    organizations_url: string
    repos_url: string
    events_url: string
    received_events_url: string
    type: string
    site_admin: boolean
  }
}