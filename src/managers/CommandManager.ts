import Logger from "@utils/Logger"
import fs from "fs"
import path from "path"
import BotClient from "@client"
import { Command } from "@types"


export default class CommandManager {
  private client: BotClient
  private logger: Logger
  public commands: BotClient["commands"]
  public categorys: BotClient["categorys"] // TODO: Fix categorys to categories

  constructor(client: BotClient) {
    this.client = client
    this.logger = new Logger("CommandManager")
    this.commands = client.commands
    this.categorys = client.categorys
  }

  public async load(commandPath = path.join(__dirname, "../commands")) {
    this.logger.debug("Loading commands...")

    const commandFolder = fs.readdirSync(commandPath)

    try {
      commandFolder.forEach((folder) => {
        if (!fs.lstatSync(path.join(commandPath, folder)).isDirectory()) return
        this.categorys.set(folder, new Array())

        try {
          const commandFiles = fs.readdirSync(path.join(commandPath, folder))

          commandFiles.forEach((commandFile) => {
            try {
              if (!commandFile.endsWith(".ts"))
                return this.logger.warn(
                  `Not a TypeScript file ${commandFile}. Skipping.`
                )

              let { default: command } = require(`../commands/${folder}/${commandFile}`)

              if (!command.name)
                return this.logger.debug(
                  `Command ${commandFile} has no name. Skipping.`
                )

              this.commands.set(command.name, command)

              this.categorys.get(folder)?.push(command.name)

              this.logger.debug(`Loaded command ${command.name}`)
            } catch (error: any) {
              this.logger.error(
                `Error loading command '${commandFile}'.\n` + error.stack
              )
            } finally {
              this.logger.debug(
                `Succesfully loaded commands. count: ${this.commands.size}`
              )
            }
          })
        } catch (error: any) {
          this.logger.error(
            `Error loading command folder '${folder}'.\n` + error.stack
          )
        }
      })
    } catch (error: any) {
      this.logger.error("Error fetching folder list.\n" + error.stack)
    }
  }

  /**
   *
   * @param {string} commandName
   * @returns {import('../structures/BotClient').Command}
   */
  public get(commandName: string): Command | undefined {
    if (this.client.commands.has(commandName))
      return this.client.commands.get(commandName)
    else if (
      this.client.commands.find(
        (cmd) => cmd.aliases && cmd.aliases.includes(commandName)
      )
    )
      return this.client.commands.find(
        (cmd) => cmd.aliases && cmd.aliases.includes(commandName)
      )
  }

  public reload(commandPath = path.join(__dirname, "../commands")) {
    this.logger.debug("Reloading commands...")

    this.commands.clear()

    this.load(commandPath).then(() => {
      this.logger.debug("Succesfully reloaded commands.")
      return "[200] Succesfully reloaded commands."
    })
  }

  /**
   * Slash Command setup tool
   * @param {import("discord.js").Snowflake} [guildID]
   * @returns {Promise<import('@discordjs/builders').SlashCommandBuilder[]>}
   */
  public async slashCommandSetup(guildID?: string) {
    this.logger.scope = "CommandManager: SlashSetup"

    let slashCommands = []
    for (let command of this.client.commands as any) {
      if (command[1].isSlash || command[1].slash) {
        slashCommands.push(
          command[1].isSlash ? command[1].data : command[1].slash?.data
        )
      }
    }

    if (!guildID) {
      this.logger.warn("guildID not gived switching global command...")
      this.logger.debug(`Trying ${this.client.guilds.cache.size} guild(s)`)

      // Todo command set to create and delete
      this.client.application.commands.set(slashCommands).then((x) => {
        this.logger.info(`Succesfully set ${x.size} guilds`)
      })
    } else {
      this.logger.info(`Slash Command requesting ${guildID}`)

      let guild = this.client.guilds.cache.get(guildID)

      await guild?.commands.set(slashCommands)

      return slashCommands
    }
  }
}
