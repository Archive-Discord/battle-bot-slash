import Config from "@config"
import Logger from "@utils/Logger"
import { Client, ClientOptions, Collection } from "discord.js"
import Dokdo from "dokdo"
import { config } from "dotenv"

import CommandManager from "@managers/CommandManager"
import EventManager from "@managers/EventManager"
import DatabaseManager from "@managers/DatabaseManager"
//import ButtonManager from "@managers/ButtonManager"
import {
  Button,
  Command,
  Event,
  IConfig
} from "@types"

import Mongoose from "mongoose"

let logger = new Logger("bot")

export default class BotClient extends Client<true> {
  public readonly config: IConfig
  public readonly VERSION: string
  public readonly BUILD_NUMBER: string
  public readonly _maxListeners: typeof Infinity
  /**
   * @deprecated
   */
  public readonly buttons!: Collection<string, Button>

  public commands: Collection<string, Command>
  public categorys: Collection<string, string[]>
  public events: Collection<string, Event | any>
  public errors: Collection<string, string>
  public schemas: Collection<string, Mongoose.Model<any, any, any, any>> // TODO: Fix any
  public dokdo: Dokdo
  public db!: Mongoose.Mongoose
  public command: CommandManager
  public event: EventManager
  public database: DatabaseManager

  constructor(options: ClientOptions = { intents: [32767], allowedMentions: { parse: ["users", "roles"], repliedUser: false }, }) {
    super(options)
    config()

    this.config = Config
    this.VERSION = this.config.BUILD_VERSION
    this.BUILD_NUMBER = this.config.BUILD_NUMBER as string

    this.commands = new Collection()
    this.categorys = new Collection()
    //this.buttons = new Collection()
    this.events = new Collection()
    this.errors = new Collection()


    this.dokdo = new Dokdo(this, {
      prefix: this.config.bot.prefix,
      owners: this.config.bot.owners,
      noPerm: () => {
        return
      },
    })

    this.db
    this.schemas = new Collection()
    this.command = new CommandManager(this)
    //this.button = new ButtonManager(this)
    this.database = new DatabaseManager(this)
    this.event = new EventManager(this)

    this._maxListeners = Infinity
  }

  public async start(token = process.env.TOKEN as string) {
    logger.info("Logging in bot...")

    this.command.load()
    //this.button.load()
    this.event.load()
    this.database.load()
    await this.login(token)
  }

  public async setStatus(status: "dev" | "online" = "online", name = "점검중...") {
    if (status.includes("dev")) {
      logger.warn("Changed status to Developent mode")

      this.user?.setPresence({
        activities: [
          {
            name: `${this.config.bot.prefix}help | ${this.VERSION}@${this.BUILD_NUMBER} : ${name}`,
          },
        ],
        status: "dnd",
      })
    } else if (status.includes("online")) {
      logger.info("Changed status to Online mode")

      this.user?.setPresence({
        activities: [
          {
            name: `${this.config.bot.prefix}help | ${this.VERSION}@${this.BUILD_NUMBER}`,
          },
        ],
        status: "online",
      })
    }
  }
}
