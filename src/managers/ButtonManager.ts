//TODO: clean-up and rewrite this as MadeGOD possible
import BotClient from "@client"
import ManagerClass from "@types/managers/manager"
import { BotClientClass, Button, Command } from "@types/structures/BotClient"
import { Collection } from "discord.js"
import { LoggerClass } from "../typings/utils/Logger"

import Logger from"../utils/Logger"
import fs from"fs"
import path from"path"
/**
 * @typedef {Object} executeOptions
 * @property {import('../structures/BotClient')} client
 * @property {import('discord.js').Message} message
 * @property {string[]} args
 */

/**
 * @extends {BaseManager}
 */
class ButtonManager implements ManagerClass {
  public client: BotClient
  public logger: LoggerClass
  public buttons: Collection<string, Button>

  constructor(client: BotClient) {
    this.client = client
    this.logger = new Logger("ButtonManager")
    this.buttons = client.buttons
  }

  async load(buttonPath = path.join(__dirname, "../buttons")) {
    this.logger.debug("Loading buttons...")
    import buttonFolder = fs.readdirSync(buttonPath)
    try {
      buttonFolder.forEach((folder: any) => {
        // TODO: Fix any
        if (!fs.lstatSync(path.join(buttonPath, folder)).isDirectory()) return

        try {
          import buttonFiles = fs.readdirSync(path.join(buttonPath, folder))

          buttonFiles.forEach((buttonFile) => {
            try {
              if (!buttonFile.endsWith(".js"))
                return this.logger.warn(
                  `Not a Javascript file ${buttonFile}. Skipping.`
                )

              let button = require(`../buttons/${folder}/${buttonFile}`)

              if (!button.name)
                return this.logger.debug(
                  `Button ${buttonFile} has no name. Skipping.`
                )
              this.buttons.set(button.name, button)

              this.logger.debug(`Loaded Buttons ${button.name}`)
            } catch (error) {
              this.logger.error(
                `Error loading Buttons '${buttonFile}'.\n` + error.stack
              )
            } finally {
              this.logger.debug(
                `Succesfully loaded buttons. count: ${this.buttons.size}`
              )
            }
          })
        } catch (error) {
          this.logger.error(
            `Error loading button folder '${folder}'.\n` + error.stack
          )
        }
      })
    } catch (error) {
      this.logger.error("Error fetching folder list.\n" + error.stack)
    }
  }

  get(buttonName: string): Command {
    if (this.client.buttons.has(buttonName))
      return this.client.buttons.get(buttonName)
    else if (
      this.client.buttons.find(
        (btn) => btn.aliases && btn.aliases.includes(buttonName)
      )
    )
      return this.client.buttons.find(
        (btn) => btn.aliases && btn.aliases.includes(buttonName)
      )
  }

  /**
   * reloading command
   * @param {string} buttonPath
   * @return {string|Error}
   */
  reload(buttonPath = path.join(__dirname, "../buttons")) {
    this.logger.debug("Reloading buttons...")
    this.buttons.clear()
    this.load(buttonPath).then(() => {
      this.logger.debug("Succesfully reloaded buttons.")
      return "[200] Succesfully reloaded buttons."
    })
  }
}

export default ButtonManager
