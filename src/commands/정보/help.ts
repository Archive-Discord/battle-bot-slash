import { SlashCommandBuilder } from '@discordjs/builders'
import config from '../../../config'
import { BaseCommand } from '../../structures/Command'
import Embed from '../../utils/Embed'
import { MessageActionRow, MessageButton, MessageEmbed } from "discord.js";

export default new BaseCommand(
  {
    name: 'help',
    description: '봇의 도움말을 보여줍니다',
    aliases: ['도움말', 'ehdna', 'ehdnaakf', '도움']
  },
  async (client, message, args) => {
    let buttton = new MessageButton()
    	.setLabel('하트 누르기')
    	.setURL("https://koreanbots.dev/bots/928523914890608671/vote")
    	.setStyle('LINK')
    let row = new MessageActionRow()
        .addComponents(buttton)
    let embed = new Embed(client, 'success')
      .setTitle(`${client.user?.username} 도움말`)
      .setColor('#2f3136')
    if (!args[0]) {
      client.categorys.forEach((category, command) => {
        if (command === 'dev') return
        embed.setDescription(`아래에 있는 명령어들을 이용해 도움말을 보세요!`)
        embed.addField(
          `\`${config.bot.prefix}도움말 ${command}\``,
          `> ${command}관련 명령어들을 보내드려요!`,
          true
        )
      })
      return message.reply({ embeds: [embed], row: [row] })
    } else {
      let commands = client.categorys.get(args[0])
      if (args[0] === 'dev') {
        // @ts-ignore
        if (!client.dokdo.owners.includes(message.author.id)) {
          embed
            .setTitle('이런...')
            .setDescription(`존재하지 않는 카테고리입니다.`)
            .setType('error')
          return message.reply({ embeds: [embed] })
        }
      }
      if (!commands) {
        embed
          .setTitle('이런...')
          .setDescription(`존재하지 않는 카테고리입니다.`)
          .setType('error')
        return message.reply({ embeds: [embed] })
      }
      embed.setDescription(`${args[0]} 관련 도움말 입니다!`)
      commands.forEach((command) => {
        embed.addField(
          `\`${config.bot.prefix}${command.name}\``,
          `> ${command.description}`,
          true
        )
      })
      return message.reply({ embeds: [embed] })
    }
  },
  {
    data: new SlashCommandBuilder()
      .setName('도움말')
      .addStringOption((option) =>
        option
          .setName('category')
          .setDescription('카테고리를 적어주세요')
          .setRequired(false)
      )
      .setDescription('봇의 도움말을 보여줍니다'),
    options: {
      name: '도움말',
      isSlash: true
    },
    async execute(client, interaction) {
    let buttton = new MessageButton()
    	.setLabel('하트 누르기')
    	.setURL("https://koreanbots.dev/bots/928523914890608671/vote")
    	.setStyle('LINK')
    let row = new MessageActionRow()
        .addComponents(buttton)
      let embed = new Embed(client, 'success')
        .setColor('#2f3136')
        .setTitle(`${client.user?.username} 도움말`)
      if (!interaction.options.getString('category')) {
        client.categorys.forEach((category, command) => {
          if (command === 'dev') return
          embed.setDescription(`아래에 있는 명령어들을 이용해 도움말을 보세요!`)
          embed.addField(
            `\`/도움말 ${command}\``,
            `> ${command}관련 명령어들을 보내드려요!`,
            true
          )
        })
        return interaction.reply({ embeds: [embed], components: [row]})
      } else {
        let category = interaction.options.getString('category')?.toLowerCase()
        if (category === 'dev') {
          // @ts-ignore
          if (!client.dokdo.owners.includes(message.author.id)) {
            embed
              .setTitle('이런...')
              .setDescription(`존재하지 않는 카테고리입니다.`)
              .setType('error')
            return interaction.reply({ embeds: [embed] })
          }
        }
        let commands = client.categorys.get(category as string)
        if (!commands) {
          embed
            .setTitle('이런...')
            .setDescription(`존재하지 않는 카테고리입니다.`)
            .setType('error')
          return interaction.reply({ embeds: [embed] })
        }
        embed.setDescription(`${category} 관련 도움말 입니다!`)
        let isSlash = commands?.filter((x) => x.isSlash)
        if (isSlash?.length === 0) {
          embed.setTitle('이런...')
          embed.setDescription(
            `${category} 카테고리에는 사용 가능한 (/) 명령어가 없어요`
          )
        } else {
          commands.forEach((command) => {
            if (!command.isSlash) return
            embed.addField(`\`/${command.name}\``, `> ${command.description}`)
          })
        }
        return interaction.reply({ embeds: [embed] })
      }
    }
  }
)
