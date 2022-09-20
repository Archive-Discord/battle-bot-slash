import config from '../../../config'
import { BaseCommand } from '../../structures/Command'
import Embed from '../../utils/Embed'
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  SlashCommandBuilder
} from 'discord.js'

export default new BaseCommand(
  {
    name: 'help',
    description: '봇의 도움말을 보여줍니다',
    aliases: ['도움말', 'ehdna', 'ehdnaakf', '도움']
  },
  async (client, message, args) => {
    let buttton = new ButtonBuilder()
      .setLabel(client.i18n.t('main.button.heart'))
      .setURL('https://koreanbots.dev/bots/928523914890608671/vote')
      .setStyle(ButtonStyle.Link)
    let row = new ActionRowBuilder<ButtonBuilder>().addComponents(buttton)
    let embed = new Embed(client, 'success')
      .setTitle(
        client.i18n.t('commands.help.title.help', {
          username: client.user?.username
        })
      )
      .setColor('#2f3136')
    if (!args[0]) {
      client.categorys.forEach((category, command) => {
        if (command === 'dev') return
        embed.setDescription(client.i18n.t('commands.help.description.helpdes'))
        embed.addFields({
          name: client.i18n.t('commands.help.fields.help', {
            prefix: config.bot.prefix,
            command: command
          }),
          value: client.i18n.t('commands.help.fields.helpv', {
            command: command
          }),
          inline: true
        })
      })
      return message.reply({ embeds: [embed], components: [row] })
    } else {
      let commands = client.categorys.get(args[0])
      if (args[0] === 'dev') {
        // @ts-ignore
        if (!client.dokdo.owners.includes(message.author.id)) {
          embed
            .setTitle(client.i18n.t('main.title.error'))
            .setDescription(client.i18n.t('commands.help.description.notfound'))
            .setType('error')
          return message.reply({ embeds: [embed], components: [row] })
        }
      }
      if (!commands) {
        embed
          .setTitle(client.i18n.t('main.title.error'))
          .setDescription(client.i18n.t('commands.help.description.notfound'))
          .setType('error')
        return message.reply({ embeds: [embed], components: [row] })
      }
      embed.setDescription(
        client.i18n.t('commands.help.description.args', {
          arg: args[0]
        })
      )
      commands.forEach((command) => {
        embed.addFields({
          name: `\`${config.bot.prefix}${command.name}\``,
          value: `> ${command.description}`,
          inline: true
        })
      })
      return message.reply({ embeds: [embed], components: [row] })
    }
  },
  {
    data: new SlashCommandBuilder()
      .setName('도움말')
      .addStringOption((option) =>
        option
          .setName('category')
          .setDescription('카테고리를 적어주세요')
          .setAutocomplete(true)
          .setRequired(false)
      )
      .setDescription('봇의 도움말을 보여줍니다'),
    options: {
      name: '도움말',
      isSlash: true
    },
    async execute(client, interaction) {
      let buttton = new ButtonBuilder()
        .setLabel(client.i18n.t('main.button.heart'))
        .setURL('https://koreanbots.dev/bots/928523914890608671/vote')
        .setStyle(ButtonStyle.Link)
      let row = new ActionRowBuilder<ButtonBuilder>().addComponents(buttton)
      let embed = new Embed(client, 'success').setColor('#2f3136').setTitle(
        client.i18n.t('commands.help.title.help', {
          username: client.user?.username
        })
      )
      if (!interaction.options.getString('category')) {
        client.categorys.forEach((category, command) => {
          if (command === 'dev') return
          embed.setDescription(
            client.i18n.t('commands.help.description.helpdes')
          )
          embed.addFields({
            name: client.i18n.t('commands.help.title.help', {
              prefix: config.bot.prefix,
              command: command
            }),
            value: client.i18n.t('commands.help.title.helpv', {
              command: command
            }),
            inline: true
          })
        })
        return interaction.reply({ embeds: [embed], components: [row] })
      } else {
        let category = interaction.options.getString('category')?.toLowerCase()
        if (category === 'dev') {
          // @ts-ignore
          if (!client.dokdo.owners.includes(message.author.id)) {
            embed
              .setTitle(client.i18n.t('main.title.error'))
              .setDescription(
                client.i18n.t('commands.help.description.notfound')
              )
              .setType('error')
            return interaction.reply({ embeds: [embed], components: [row] })
          }
        }
        let commands = client.categorys.get(category as string)
        if (!commands) {
          embed
            .setTitle(client.i18n.t('main.title.error'))
            .setDescription(client.i18n.t('commands.help.description.notfound'))
            .setType('error')
          return interaction.reply({ embeds: [embed], components: [row] })
        }
        embed.setDescription(
          client.i18n.t('commands.help.description.args', {
            arg: category
          })
        )
        let isSlash = commands?.filter((x) => x.isSlash)
        if (isSlash?.length === 0) {
          embed.setTitle(client.i18n.t('main.title.error'))
          embed.setDescription(
            client.i18n.t('commands.help.description.notfound2', {
              category: category
            })
          )
        } else {
          commands.forEach((command) => {
            if (!command.isSlash) return
            embed.addFields({
              name: `\`/${command.name}\``,
              value: `> ${command.description}`
            })
          })
        }
        return interaction.reply({ embeds: [embed], components: [row] })
      }
    }
  }
)
