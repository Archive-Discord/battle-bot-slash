import BotClient from "@client"

import { SlashCommandBuilder } from '@discordjs/builders'
import { CommandInteraction, Message } from 'discord.js'
import Embed from '../../utils/Embed'

export default {
  name: 'help',
  description: '봇의 도움말을 보여줍니다',
  aliases: ['도움말', 'ehdna', 'ehdnaakf', '도움'],
  isSlash: false,
  /**
   * @param {import('../../structures/BotClient')} client 
   * @param {Discord.Message} message 
   * @param {string[]} args 
   */
  async execute(client: BotClient, message: Message, args: string[]) {
    let embed = new Embed(client, 'success')
      .setTitle(`${client.user.username} 도움말`)
    if (!args[0]) {
      client.categorys.forEach((data, c) => {
        if (['dev'].includes(c.toLowerCase())) return
        let commands = cmdFormat(client.categorys.get(c), client)
        if (commands) embed.addField(c.toUpperCase(), commands)
      })

      message.reply({ embeds: [embed] })
    } else {
      let category = args[0].toLowerCase()
      if (!client.categorys.has(category)) {
        embed.setTitle('이런...')
          .setDescription(`존재하지 않는 카테고리입니다.`)
          .setType('error')

        return message.reply({ embeds: [embed] })

      }
      let commands = cmdFormat(client.categorys.get(category), client)
      if (!commands) {
        embed.setTitle('이런...')
          .setDescription(`존재하지 않는 카테고리입니다.`)
          .setType('error')
        return message.reply({ embeds: [embed] })
      }
      embed.setTitle(`${category.toUpperCase()} 카테고리의 도움말`)
        .addField('명령어', commands)
      message.reply({ embeds: [embed] })
    }
  },
  slash: {
    name: 'help',
    data: new SlashCommandBuilder()
      .setName('help')
      .setDescription('봇의 도움말을 보여줍니다.')
      .addStringOption(option => option.setName('category').setDescription('카테고리를 적어주세요').setRequired(false))
      .toJSON(),
    async execute(client: BotClient, interaction: CommandInteraction) {
      let embed = new Embed(client, 'success')
        .setTitle(`${client.user.username} 도움말`)
      if (!interaction.options.getString('category')) {
        client.categorys.forEach((data, c) => {
          if (['dev'].includes(c.toLowerCase())) return
          let commands = cmdFormat(client.categorys.get(c), client)
          if (commands) embed.addField(c.toUpperCase(), commands)
        })

        interaction.reply({ embeds: [embed] })
      } else {
        let category = interaction.options.getString('category')?.toLowerCase() as string
        if (!client.categorys.has(category)) {
          embed.setTitle('이런...')
            .setDescription(`존재하지 않는 카테고리입니다.`)
            .setType('error')

          return interaction.reply({ embeds: [embed] })

        }
        let commands = cmdFormat(client.categorys.get(category), client)
        if (!commands) {
          embed.setTitle('이런...')
            .setDescription(`존재하지 않는 카테고리입니다.`)
            .setType('error')
          return interaction.reply({ embeds: [embed] })
        }
        embed.setTitle(`${category.toUpperCase()} 카테고리의 도움말`)
          .addField('명령어', commands)
        interaction.reply({ embeds: [embed] })
      }
    }
  }
}

function cmdFormat(cmds: string | string[] | undefined, client: BotClient): string | undefined {
  var array = new Array()

  if (!cmds) return;

  Object.values(cmds).forEach(c => array.push(client.commands.get(c)))
  array = array.map(r => r.aliases ? r.aliases[0] : r.name)

  if (array.length === 0) return undefined
  else return '`' + array.join('`, `') + '`'
}