import BotClient from "@client"
import { Collection, Message } from "discord.js"
import Dokdo from "dokdo"
import Mongoose from "mongoose"
import ConfigFile from "@types/config"

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

export interface BotClientClass {
  config: ConfigFile
  VERSION: string
  BUILD_NUMBER: string
  commands: Collection<string, Command>
  categorys: Collection<string, string[]>
  buttons: Collection<string, Button>
  events: Collection<string, Event>
  errors: Collection<string, Error>
  schemas: Collection<string, Mongoose.Model>
  dokdo: Dokdo
  db: Mongoose.Mongoose
  _maxListeners: Infinity
}
