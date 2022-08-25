// @ts-nocheck
/* eslint-disable no-unused-vars */

// Slash command and Message Command
import { SlashCommandBuilder } from '@discordjs/builders'
import { CommandInteraction, Message } from 'discord.js'
import { BaseCommand } from '../../structures/Command'
import BotClient from '../../structures/BotClient'

export default new BaseCommand({
  name: '',
  description: '',
  aliases: [],
}, async (client, message, args) => {

}, {
  data: new SlashCommandBuilder()
    .setName('')
    .setDescription(''),
  options: {
    isSlash: true,
  },
  async execute(client, interaction) {

  }
})

// Message command

import { MessageCommand } from './structures/Command'

export default new MessageCommand({
  name: '',
  description: '',
  aliases: [],
}, async (client, message, args) => {
})

// Slash command

import { SlashCommand } from './structures/Command'

export default new SlashCommand(

  new SlashCommandBuilder()
    .setName('')
    .setDescription(''),
  async (client, interaction) => {

  }, {
  isSlash: true,
}
)
