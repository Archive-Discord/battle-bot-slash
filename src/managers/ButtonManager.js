const Logger = require('../utils/Logger')
const BaseManager = require('./BaseManager')
const fs = require('fs')
const path = require('path')

/**
 * @typedef {Object} executeOptions
 * @property {import('../structures/BotClient')} client
 * @property {import('discord.js').Message} message
 * @property {string[]} args
 */


/**
 * @extends {BaseManager}
 */
class ButtonManager extends BaseManager {
  /**
   * Button Manager constructor
   * @param {import('../structures/BotClient')} client Bot client
   */
  constructor(client) {
    super(client)
    
    this.logger = new Logger('ButtonManager')
    this.buttons = client.buttons
  }

  /**
   * Load v from a directory
   * @param {string} ButtonPath ButtonPath is the path to the folder containing the commands
   */
  async load(buttonPath = path.join(__dirname, '../buttons')) {
    this.logger.debug('Loading buttons...')

    const buttonFolder = fs.readdirSync(buttonPath)

    try {
      buttonFolder.forEach(folder => {
        if (!fs.lstatSync(path.join(buttonPath, folder)).isDirectory()) return

        try {
          const buttonFiles = fs.readdirSync(path.join(buttonPath, folder))

          buttonFiles.forEach((buttonFile) => {
            try {
              if (!buttonFile.endsWith('.js')) return this.logger.warn(`Not a Javascript file ${buttonFile}. Skipping.`)

              let button = require(`../buttons/${folder}/${buttonFile}`)

              if(!button.name) return this.logger.debug(`Button ${buttonFile} has no name. Skipping.`)
              this.buttons.set(button.name, button)
              
              this.logger.debug(`Loaded Buttons ${button.name}`)
            } catch (error) {
              this.logger.error(`Error loading Buttons '${buttonFile}'.\n` + error.stack)
            } finally {
              this.logger.debug(`Succesfully loaded buttons. count: ${this.buttons.size}`)
            }
          })
        } catch (error) {
          this.logger.error(`Error loading button folder '${folder}'.\n` + error.stack)
        }
      })
    } catch (error) {
      this.logger.error('Error fetching folder list.\n' + error.stack)
    }
  }

  /**
   * 
   * @param {string} buttonName
   * @returns {import('../structures/BotClient').Command}
   */
  get(buttonName) {
    if(this.client.buttons.has(buttonName))
      return this.client.buttons.get(buttonName)
    else if(this.client.buttons.find(btn => btn.aliases && btn.aliases.includes(buttonName))) 
      return this.client.buttons.find(btn => btn.aliases && btn.aliases.includes(buttonName))
    
  }

  /**
   * reloading command
   * @param {string} buttonPath 
   * @return {string|Error}
   */
  reload(buttonPath = path.join(__dirname, '../buttons')) {
    this.logger.debug('Reloading buttons...')

    this.buttons.clear()

    this.load(buttonPath).then(() => {
      this.logger.debug('Succesfully reloaded buttons.')
      return '[200] Succesfully reloaded buttons.'
    })
  }
}

module.exports = ButtonManager