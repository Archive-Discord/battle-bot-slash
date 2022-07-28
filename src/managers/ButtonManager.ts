import { BaseButton } from '../../typings/structures'
import Logger from '../utils/Logger'
import BaseManager from './BaseManager'
import fs from 'fs'
import path from 'path'
import BotClient from '../structures/BotClient'

export default class ButtonManager extends BaseManager {
  private logger = new Logger('ButtonManager')
  private buttons: BotClient['buttons']

  public constructor(client: BotClient) {
    super(client)

    this.buttons = client.buttons
  }

  public load(buttonPath: string = path.join(__dirname, '../buttons')): void {
    this.logger.info('Loading buttons...')

    const buttonFolder = fs.readdirSync(buttonPath)

    try {
      buttonFolder.forEach((folder) => {
        if (!fs.lstatSync(path.join(buttonPath, folder)).isDirectory()) return

        try {
          const buttonFiles = fs.readdirSync(path.join(buttonPath, folder))

          buttonFiles.forEach((buttonFile) => {
            try {
              const {
                default: button
                // eslint-disable-next-line @typescript-eslint/no-var-requires
              } = require(`../buttons/${folder}/${buttonFile}`)

              if (!button.data.name ?? !button.name)
                return this.logger.debug(
                  `Button ${buttonFile} has no name. Skipping.`
                )

              this.buttons.set(button.data.name ?? button.name, button)

              this.logger.debug(
                `Loaded Button ${button.data.name ?? button.name}`
              )
            } catch (error: any) {
              this.logger.error(
                `Error loading button '${buttonFile}'.\n` + error.stack
              )
            } finally {
              this.logger.debug(`Loaded buttons. count: ${this.buttons.size}`)
            }
          })
        } catch (error: any) {
          this.logger.error(
            `Error loading button folder '${folder}'.\n` + error.stack
          )
        }
      })
      this.logger.info(
        `Succesfully loaded buttons. count: ${this.buttons.size}`
      )
    } catch (error: any) {
      this.logger.error('Error fetching folder list.\n' + error.stack)
    }
  }

  public get(commandName: string): BaseButton | undefined {
    if (this.client.buttons.has(commandName))
      return this.client.buttons.get(commandName)
  }

  public reload(buttonPath: string = path.join(__dirname, '../buttons')) {
    this.logger.debug('Reloading buttons...')

    this.buttons.clear()
    try {
      this.load(buttonPath)
    } finally {
      this.logger.debug('Succesfully reloaded buttons.')
      // eslint-disable-next-line no-unsafe-finally
      return { message: '[200] Succesfully reloaded commands.' }
    }
  }
}
