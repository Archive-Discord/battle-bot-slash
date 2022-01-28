/* eslint-disable no-unused-vars */

// Slash command and Message Command
const { SlashCommandBuilder } = require('@discordjs/builders')
const Discord = require('discord.js')

export default {
  name: '',
  description : '',
  aliases: [],
  isSlash: false,
  /**
   * @param {import('../../structures/BotClient')} client 
   * @param {Discord.Message} message 
   * @param {string[]} args 
   */
  async execute(client, message, args) {
    
  },
  slash: {
    name: '',
    data: new SlashCommandBuilder()
      .setName('')
      .setDescription('')
      .toJSON(),
    /**
     * 
     * @param {import('../../structures/BotClient')} client 
     * @param {Discord.CommandInteraction} interaction 
     */
    async execute(client, interaction) {

    }
  }
}

// Message command

const Discord = require('discord.js')
const { SlashCommandBuilder } = require('@discordjs/builders')

export default {
  name: '',
  description : '',
  aliases: [],
  isSlash: false,
  /**
   * @param {import('../../structures/BotClient')} client 
   * @param {Discord.Message} message 
   * @param {string[]} args 
   */
  async execute(client, message, args) {
  },
}

// Slash command
const Discord = require('discord.js')
const { SlashCommandBuilder } = require('@discordjs/builders')

export default {
  name: '',
  description : '',
  isSlash: true,
  data: new SlashCommandBuilder()
    .setName('')
    .setDescription('')
    .toJSON(),
  /**
   * 
   * @param {import('../../structures/BotClient')} client 
   * @param {Discord.CommandInteraction} interaction 
   */
  async execute(client, interaction) {

  }
}