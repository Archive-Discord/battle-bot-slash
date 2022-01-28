import Config from "@config"
import Logger from "@utils/Logger"
import { Client, ClientOptions, Collection } from "discord.js"
import Dokdo from "dokdo"
import { config } from "dotenv"

import CommandManager from "@managers/CommandManager"
import EventManager from "@managers/EventManager"
import DatabaseManager from "@managers/DatabaseManager"
//import ButtonManager from "@managers/ButtonManager"

import ConfigFile from "@types/config"
import {
  BotClientClass,
  Button,
  Command,
  Event,
} from "@types/structures/BotClient"

import Mongoose from "mongoose"

const logger = new Logger("bot")

/**
 * @typedef {string} Error
 */

export default class BotClient extends Client implements BotClientClass {
  public config: ConfigFile
  public VERSION: string
  public BUILD_NUMBER: string
  public commands: Collection<string, Command>
  public categorys: Collection<string, string[]>
  /**
   * @deprecated
   */
  public readonly buttons!: Collection<string, Button>
  public events: Collection<string, Event>
  public errors: Collection<string, string>
  public schemas: Collection<string, Mongoose.Model<any, any, any, any>> // TODO: Fix any
  public dokdo: Dokdo
  public db!: Mongoose.Mongoose
  public _maxListeners: typeof Infinity

  constructor(options: ClientOptions = { intents: [32767], allowedMentions: { parse: ["users", "roles"], repliedUser: false },}) {
    super(options)
    config()
    this.config = Config
    this.VERSION = this.config.BUILD_VERSION
    this.BUILD_NUMBER = this.config.BUILD_NUMBER
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
    this._maxListeners = Infinity
    /**
     * @type {CommandManager}
     */
    this.command = new CommandManager(this)

    /**
     * @type {ButtonManager}
     */
    //this.button = new ButtonManager(this)

    /**
     * @type {EventManager}
     */
    this.event = new EventManager(this)

    /**
     * @type {DatabaseManager}
     */
    this.database = new DatabaseManager(this)
  }

  public async start(token = process.env.TOKEN as string) {
    logger.info("Logging in bot...")

    this.command.load()
    //this.button.load()
    this.event.load()
    this.database.load()
    await this.login(token)
  }

  async setStatus(status: "dev" | "online" = "online", name = "점검중...") {
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
