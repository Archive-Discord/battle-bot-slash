import { SlashCommandBuilder } from '@discordjs/builders'
import {
  Message,
  ClientEvents,
  Awaitable,
  CommandInteraction,
  ButtonInteraction as ButtonInteractionType
} from 'discord.js'
import BotClient from '../src/structures/BotClient'
import { PlayerEvents } from 'discord-player'

export interface MessageCommnad {
  data: MessageCommandOptions
  execute: MessageCommandFuntion
}
export interface Command extends MessageCommnad {
  isSlash?: boolean
  slash?: SlashCommand
}

export interface SlashCommand {
  data: SlashCommandBuilder
  execute: SlashCommandFunction
  options?: SlashCommandOptions
  slash?: SlashCommand
}

export interface MessageCommandOptions {
  name: string
  description: string
  aliases: string[]
}

export interface ButtonInteractionOptions {
  name: string
  description?: string
}

export interface ButtonInteraction {
  data: SlashCommandBuilder
  execute: ButtonInteractionFunction
  options?: ButtonInteractionOptions
}

export type ButtonInteractionFunction = (
  client: BotClient,
  interaction: ButtonInteractionType
) => Awaitable<void> | Promise<any>

export type MessageCommandFuntion = (
  client: BotClient,
  message: Message,
  args: string[]
) => Awaitable<void> | Promise<any>

export type SlashCommandFunction = (
  client: BotClient,
  interaction: CommandInteraction
) => Promise<any>

export interface SlashCommandOptions {
  name: string
  isSlash?: boolean
}

export interface Event {
  name: keyof ClientEvents
  options?: EventOptions
  execute: (
    client: BotClient,
    ...args: ClientEvents[keyof ClientEvents]
  ) => Awaitable<void>
}

export interface MusicEvent {
  name: keyof PlayerEvents
  execute: (
    client: BotClient,
    ...args: PlayerEvents[keyof PlayerEvents]
  ) => Awaitable<void>
}

export type EventFunction<E extends keyof ClientEvents> = (
  client: BotClient,
  ...args: ClientEvents[E]
) => Promise<any>

export interface EventOptions {
  once: boolean
}

export interface Categorys {
  name: string
  description: string
  isSlash?: boolean
}

export type BaseCommand = MessageCommnad | SlashCommand | Command
export type BaseButton = ButtonInteraction
