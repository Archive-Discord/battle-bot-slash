import fs from 'fs'
import path from 'path'
import Logger from '@utils/Logger'
import BotClient from '@client'
import { Event } from '@types'

export default class EventManager {
  private client: BotClient
  private logger: Logger
  private events: BotClient['events']

  constructor(client: BotClient) {

    this.logger = new Logger('EventManager')
    this.client = client
    this.events = client.events
  }

  async load(eventPath = path.join(__dirname, '../events')) {
    this.logger.debug('Loading events...')

    const eventFiles = fs.readdirSync(eventPath)

    eventFiles.forEach(async (eventFile) => {
      try {
        if (!eventFile.endsWith('.ts')) return this.logger.warn(`Not a TypeScript file ${eventFile}. Skipping.`)

        let { default: event } = require(`../events/${eventFile}`)

        if (!event?.name) return this.logger.warn(`Event ${eventFile} has no name. Skipping.`)

        this.events.set(event.name, event)
        this.logger.debug(`Loaded event ${eventFile}`)
      } catch (error: any) {
        this.logger.error(`Error loading events '${eventFile}'.\n` + error.stack)
      }
    })
    this.logger.debug(`Succesfully loaded events. count: ${this.events.size}`)

    this.start()
  }

  private async start() {
    this.logger.debug('Starting event files...')

    //this.client.removeAllListeners()
    this.events.forEach((event, eventName) => {
      if (event.once) {
        this.client.once(eventName, (...args) => {
          event.execute(this.client, ...args)
        })

        this.logger.debug(`Started event '${eventName}' once.`)
      } else {
        this.client.on(eventName, (...args) => {
          event.execute(this.client, ...args)
        })

        this.logger.debug(`Started event '${eventName}' on.`)
      }
    })
  }

  /**
   * @param {import('discord.js').ClientEvents} eventName
   */
  reload(eventName: string) {
    if (!this.events.has(eventName)) {
      return this.logger.warn(`Event '${eventName}' not found.`)
    } else {
      this.logger.debug(`Reloading ${eventName}...`)
      this.events.delete(eventName)

      const eventFiles = fs.readdirSync(path.join(__dirname, '../events'))

      eventFiles.forEach(async (eventFile) => {
        try {
          let event = require(`../events/${eventFile}`)

          if (event.name === eventName) {
            this.client.removeListener(eventName, async (...args) => {
              event.execute(this.client, ...args)
            })
            this.events.set(event.name, event)
            this.logger.debug(`Loaded event ${eventName}`)
          }

        } catch (error) {
          console.log(error)
        }
      })
    }
  }
  /**
   * @param {string} eventPath 
   */
  reloadAll(eventPath = path.join(__dirname, '../events')) {
    this.logger.debug('Reloading events...')

    this.events.clear()
    this.load(eventPath)
  }

  /**
   * @param {import('discord.js').ClientEvents} eventName 
   * @param {Function} fn
   * @example EventManager.register('ready', (client) => {
   *  console.log(`${client.user.tag} is ready!`)
   * })
   */
  register(eventName: string, fn: Function) {
    this.events.set(eventName, fn)

    this.client.addListener(eventName, (...args) => {
      fn(this.client, ...args)
    })

    this.logger.debug(`Registered event '${eventName}'`)
  }

}