import {
  ApplicationCommandDataResolvable,
  Routes,
  RESTPostAPIApplicationCommandsJSONBody
} from 'discord.js'
import { BaseCommand, Command, SlashCommand } from '../../typings/structures'

import Logger from '../utils/Logger'
import BaseManager from './BaseManager'
import fs from 'fs'
import path from 'path'
import BotClient from '../structures/BotClient'
import config from '../../config'
import { REST } from '@discordjs/rest'

export default class CommandManager extends BaseManager {
  private logger = new Logger('CommandManager')
  private commands: BotClient['commands']
  private categorys: BotClient['categorys']

  public constructor(client: BotClient) {
    super(client)

    this.commands = client.commands
    this.categorys = client.categorys
  }

  public load(commandPath: string = path.join(__dirname, '../commands')): void {
    this.logger.debug('Loading commands...')

    const commandFolder = fs.readdirSync(commandPath)

    try {
      commandFolder.forEach((folder) => {
        if (!fs.lstatSync(path.join(commandPath, folder)).isDirectory()) return
        this.categorys.set(folder, [])

        try {
          const commandFiles = fs.readdirSync(path.join(commandPath, folder))

          commandFiles.forEach((commandFile) => {
            try {
              /*if (!commandFile.endsWith('.ts') || !commandFile.endsWith('.js'))
                return this.logger.warn(
                  `Not a TypeScript file ${commandFile}. Skipping.`
                )*/

              const command =
                // eslint-disable-next-line @typescript-eslint/no-var-requires
                require(`../commands/${folder}/${commandFile}`).default
              if (!command.data.name ?? !command.name)
                return this.logger.debug(
                  `Command ${commandFile} has no name. Skipping.`
                )
              this.categorys.get(folder)?.push({
                name: command.data.aliases[0] ?? command.aliases[0],
                description: command.data.description ?? command.description,
                isSlash: (command as Command)?.slash
                  ? true
                  : (command as SlashCommand)?.options?.isSlash
                  ? true
                  : false
              })
              this.commands.set(command.data.name ?? command.name, command)

              this.logger.debug(
                `Loaded command ${command.data.name ?? command.name}`
              )
            } catch (error: any) {
              this.logger.error(
                `Error loading command '${commandFile}'.\n` + error.stack
              )
            } finally {
              this.logger.debug(
                `Succesfully loaded commands. count: ${this.commands.size}`
              )
              // eslint-disable-next-line no-unsafe-finally
              return this.commands
            }
          })
        } catch (error: any) {
          this.logger.error(
            `Error loading command folder '${folder}'.\n` + error.stack
          )
        }
      })
    } catch (error: any) {
      this.logger.error('Error fetching folder list.\n' + error.stack)
    }
  }

  public get(commandName: string): BaseCommand | undefined {
    let command
    if (this.client.commands.has(commandName))
      return (command = this.client.commands.get(commandName))

    this.client.commands.forEach((cmd) => {
      if (this.isSlash(cmd) && cmd.data.name === commandName)
        return (command = cmd)
      // @ts-ignore
      if (cmd.data.aliases.includes(commandName)) return (command = cmd)
    })

    return command
  }

  public reload(commandPath: string = path.join(__dirname, '../commands')) {
    this.logger.debug('Reloading commands...')

    this.commands.clear()
    try {
      this.load(commandPath)
    } finally {
      this.logger.debug('Succesfully reloaded commands.')
      // eslint-disable-next-line no-unsafe-finally
      return { message: '[200] Succesfully reloaded commands.' }
    }
  }

  public isSlash(command: BaseCommand | undefined): command is SlashCommand {
    //return command?.options.slash ?? false
    return (command as Command)?.slash
      ? true
      : (command as SlashCommand)?.options?.isSlash
      ? true
      : false
  }

  public async slashCommandSetup(
    guildID: string
  ): Promise<ApplicationCommandDataResolvable[] | undefined> {
    this.logger.scope = 'CommandManager: SlashSetup'
    const rest = new REST().setToken(this.client.token!)

    const slashCommands: any[] = []
    this.client.commands.forEach((command: BaseCommand) => {
      if (this.isSlash(command)) {
        slashCommands.push(command.slash ? command.slash?.data : command.data)
      }
    })

    if (!guildID) {
      this.logger.warn('guildID not gived switching global command...')
      this.logger.debug(`Trying ${this.client.guilds.cache.size} guild(s)`)

      await rest
        // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
        .put(Routes.applicationCommands(this.client.application?.id!), {
          body: slashCommands
        })
        .then(() =>
          this.logger.info(
            `Successfully registered application global commands.`
          )
        )
    } else {
      this.logger.info(`Slash Command requesting ${guildID}`)

      await rest
        // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
        .put(
          Routes.applicationGuildCommands(
            this.client.application?.id!,
            guildID
          ),
          {
            body: slashCommands
          }
        )
        .then(() =>
          this.logger.info(
            `Successfully registered server ${guildID} server commands.`
          )
        )

      return slashCommands
    }
  }

  public async slashGlobalCommandSetup(): Promise<void> {
    this.logger.scope = 'CommandManager: SlashGlobalSetup'
    const rest = new REST().setToken(this.client.token!)

    const slashCommands: RESTPostAPIApplicationCommandsJSONBody[] = []
    this.client.commands.forEach((command: BaseCommand) => {
      if (this.isSlash(command)) {
        slashCommands.push(
          command.slash ? command.slash?.data.toJSON() : command.data.toJSON()
        )
      }
    })
    this.logger.debug(`Trying ${this.client.guilds.cache.size} guild(s)`)
    for (const command of slashCommands) {
      const commands = await this.client.application?.commands.fetch()
      const cmd = commands?.find((cmd) => cmd.name === command.name)
      const category = this.categorys.get('dev')

      if (category?.find((c) => c.name === command.name)) {
        const supportGuild = this.client.guilds.cache.get(
          config.devGuild.guildID
        )
        await rest
          .put(
            Routes.applicationGuildCommands(
              this.client.application?.id!,
              config.devGuild.guildID
            ),
            { body: [command] }
          )
          .then(() => {
            this.logger.info(
              `Succesfully created Developer command ${command.name} at ${supportGuild?.name} guild`
            )
          })
          .catch((e) => {
            console.log(e)
            this.logger.error(
              `Error created Developer command ${command.name} at ${supportGuild?.name} guild`
            )
          })
      }
    }
    await rest
      .put(Routes.applicationCommands(this.client.application?.id!), {
        body: slashCommands
      })
      .then(() =>
        this.logger.info(
          `Succesfully created command ${
            slashCommands.length > 3
              ? slashCommands.slice(0, 3).map((object) => object.name) +
                `\ and ${slashCommands.length - 3} more command`
              : slashCommands.map((object) => object.name + ', ')
          } at ${this.client.guilds.cache.size} guild`
        )
      )
  }
}
