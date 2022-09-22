import { SlashCommandBuilder } from '@discordjs/builders'
import { ButtonStyle, version } from 'discord.js'
import config from '../../../config'
import { repository } from '../../../package.json'
import { BaseCommand } from '../../structures/Command'
import DateFormatting from '../../utils/DateFormatting'
import Embed from '../../utils/Embed'
import { ActionRowBuilder, ButtonBuilder } from 'discord.js'
const memory = () => {
  const memory = process.memoryUsage().rss
  return (memory / 1024 / 1024).toFixed(2) + 'MB'
}
export default new BaseCommand(
  {
    name: 'info',
    description: '봇의 정보를 보여줍니다',
    aliases: ['정보', 'info', 'wjdqh']
  },
  async (client, message, args) => {
    let buttton = new ButtonBuilder()
      .setLabel(client.i18n.t('main.button.heart'))
      .setURL('https://koreanbots.dev/bots/928523914890608671/vote')
      .setStyle(ButtonStyle.Link)
    let row = new ActionRowBuilder<ButtonBuilder>().addComponents(buttton)
    let embed = new Embed(client, 'default')
      .setTitle(
        client.i18n.t('commands.info.title.info', {
          username: client.user?.username
        })
      )
      .setColor('#2f3136')
    embed.setDescription(
      client.i18n.t('commands.info.description.shardEmbed', {
        id: message.guild?.shard.id,
        ping: client.ws.ping
      })
    )
    embed.addFields({
      name: client.i18n.t('commands.info.fields.server'),
      value: client.i18n.t('commands.info.fields.serverv', {
        size: client.guilds.cache.size
      }),
      inline: true
    })
    embed.addFields({
      name: client.i18n.t('commands.info.fields.user'),
      value: client.i18n.t('commands.info.fields.userv', {
        usercount: client.guilds.cache.reduce((a, b) => a + b.memberCount, 0)
      }),
      inline: true
    })
    embed.addFields({
      name: client.i18n.t('commands.info.fields.uptime'),
      value: `${DateFormatting.relative(
        new Date(Date.now() - process.uptime() * 1000)
      )}`,
      inline: true
    })
    embed.addFields({
      name: client.i18n.t('commands.info.fields.systeminfo'),
      value: `\`\`\`diff\n- Discord.js: ${version} \n- Node.js: ${
        process.version
      }\n- OS: ${process.platform} - Memory: ${memory()} \`\`\``
    })
    embed.addFields({
      name: client.i18n.t('commands.info.fields.usefullink'),
      value: client.i18n.t('commands.info.fields.usefullinkv')
    })
    return message.reply({ embeds: [embed], components: [row] })
  },
  {
    data: new SlashCommandBuilder()
      .setName('정보')
      .setDescription('봇의 정보를 보여줍니다'),
    options: {
      name: '정보',
      isSlash: true
    },
    async execute(client, interaction) {
      let buttton = new ButtonBuilder()
        .setLabel(client.i18n.t('main.button.heart'))
        .setURL('https://koreanbots.dev/bots/928523914890608671/vote')
        .setStyle(ButtonStyle.Link)
      let row = new ActionRowBuilder<ButtonBuilder>().addComponents(buttton)
      let embed = new Embed(client, 'default')
        .setTitle(
          client.i18n.t('commands.info.title.info', {
            username: client.user?.username
          })
        )
        .setColor('#2f3136')
      embed.setDescription(
        client.i18n.t('commands.info.description.shardEmbed', {
          id: interaction.guild?.shard.id,
          ping: client.ws.ping
        })
      )
      embed.addFields({
        name: client.i18n.t('commands.info.fields.server'),
        value: client.i18n.t('commands.info.fields.serverv', {
          size: client.guilds.cache.size
        }),
        inline: true
      })
      embed.addFields({
        name: client.i18n.t('commands.info.fields.user'),
        value: client.i18n.t('commands.info.fields.userv', {
          usercount: client.guilds.cache.reduce((a, b) => a + b.memberCount, 0)
        }),
        inline: true
      })
      embed.addFields({
        name: client.i18n.t('commands.info.fields.uptime'),
        value: `${DateFormatting.relative(
          new Date(Date.now() - process.uptime() * 1000)
        )}`,
        inline: true
      })
      embed.addFields({
        name: client.i18n.t('commands.info.fields.systeminfo'),
        value: `\`\`\`diff\n- Discord.js: ${version} \n- Node.js: ${
          process.version
        }\n- OS: ${process.platform} - Memory: ${memory()} \`\`\``
      })
      embed.addFields({
        name: client.i18n.t('commands.info.fields.usefullink'),
        value: client.i18n.t('commands.info.fields.usefullinkv')
      })
      return interaction.reply({
        embeds: [embed],
        components: [row],
        ephemeral: true
      })
    }
  }
)
