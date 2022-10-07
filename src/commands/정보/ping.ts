import { BaseCommand } from '../../structures/Command';
import Discord from 'discord.js';
import Embed from '../../utils/Embed';
import { SlashCommandBuilder } from '@discordjs/builders';

export default new BaseCommand(
  {
    name: 'ping',
    description: '핑을 측정합니다.',
    aliases: ['핑', '측정', 'vld'],
  },
  async (client, message, args) => {
    let embed = new Embed(client, 'warn')
      .setTitle(client.i18n.t('commands.ping.loading.title'))
      .setColor('#2f3136')

    let m = await message.reply({
      embeds: [embed],
    });
    embed = new Embed(client, 'success')
      .setColor('#2f3136')
      .setTitle(client.i18n.t('commands.ping.title'))
      .addFields({
        name: client.i18n.t('commands.ping.fields.message'),
        value: `${Number(m.createdAt) - Number(message.createdAt)}ms`,
        inline: true
      })
      .addFields({
        name: client.i18n.t('commands.ping.fields.api'),
        value: `${client.ws.ping}ms`,
        inline: true
      })
      .addFields({
        name: client.i18n.t('commands.ping.fields.uptime'),
        value: `<t:${(Number(client.readyAt) / 1000) | 0}:R>`,
        inline: true
      })

    m.edit({
      embeds: [embed],
    });
  },
  {
    data: new SlashCommandBuilder().setName('핑').setDescription('핑을 측정합니다.'),
    options: {
      name: '핑',
      isSlash: true,
    },
    async execute(client, interaction) {
      let PingEmbed = new Embed(client, 'success')
        .setColor('#2f3136')
        .setTitle(client.i18n.t('commands.ping.title'))
        .addFields({
          name: client.i18n.t('commands.ping.fields.api'),
          value: `${client.ws.ping}ms`
        })
        .addFields({
          name: client.i18n.t('commands.ping.fields.message'),
          value: `${(Date.now() - interaction.createdTimestamp) | 0}ms`,
          inline: true
        })
        .addFields({
          name: client.i18n.t('commands.ping.fields.uptime'),
          value: `<t:${(Number(client.readyAt) / 1000) | 0}:R>`
        })
      interaction.reply({ embeds: [PingEmbed], ephemeral: true })
    }
  }
)
