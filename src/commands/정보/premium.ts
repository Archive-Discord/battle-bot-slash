import { BaseCommand } from '../../structures/Command';
import Discord from 'discord.js';
import Embed from '../../utils/Embed';
import { SlashCommandBuilder } from '@discordjs/builders';
import Premium from '../../schemas/premiumSchemas';
import config from '../../../config';

export default new BaseCommand(
  {
    name: 'premium',
    description: '서버의 프리미엄 만료일을 보여줍니다',
    aliases: ['프리미엄', 'vmflaldja'],
  },
  async (client, message, args) => {
    let embed = new Embed(client, 'success').setColor('#2f3136').setTitle(
      client.i18n.t('commands.premium.title.premium', {
        username: client.user?.username
      })
    )
    if (!message.guild) {
      embed.setDescription(client.i18n.t('main.description.onlyserver'))
      return message.reply({ embeds: [embed] })
    }
    let premium = await Premium.findOne({ guild_id: message.guild.id })
    if (!premium) {
      embed.setDescription(
        client.i18n.t('commands.premium.description.premium')
      )
      return message.reply({ embeds: [embed] })
    } else {
      let nextpay_date = new Date(premium.nextpay_date)
      let now = new Date()
      if (now > nextpay_date) {
        embed.setDescription(
          client.i18n.t('commands.premium.description.premiumdate', {
            year: nextpay_date.getFullYear(),
            month: nextpay_date.getMonth() + 1,
            date: nextpay_date.getDate()
          })
        )
        return message.reply({ embeds: [embed] })
      } else {
        embed.setDescription(
          client.i18n.t('commands.premium.description.premiumdate2', {
            year: nextpay_date.getFullYear(),
            month: nextpay_date.getMonth() + 1,
            date: nextpay_date.getDate()
          })
        )
        return message.reply({ embeds: [embed] })
      }
    }
  },
  {
    data: new SlashCommandBuilder()
      .setName('프리미엄')
      .setDescription('서버의 프리미엄 정보를 확인합니다'),
    options: {
      name: '프리미엄',
      isSlash: true,
    },
    async execute(client, interaction) {
      await interaction.deferReply({ ephemeral: true })
      let embed = new Embed(client, 'success').setColor('#2f3136').setTitle(
        client.i18n.t('commands.premium.title.premium', {
          username: client.user?.username
        })
      )
      if (!interaction.guild) {
        embed.setDescription(client.i18n.t('main.description.onlyserver'))
        return interaction.editReply({ embeds: [embed] })
      }
      let premium = await Premium.findOne({ guild_id: interaction.guild.id })
      if (!premium) {
        embed.setDescription(
          client.i18n.t('commands.premium.description.premium')
        )
        return interaction.editReply({ embeds: [embed] })
      } else {
        let nextpay_date = new Date(premium.nextpay_date)
        let now = new Date()
        if (now > nextpay_date) {
          embed.setDescription(
            client.i18n.t('commands.premium.description.premiumdate', {
              year: nextpay_date.getFullYear(),
              month: nextpay_date.getMonth() + 1,
              date: nextpay_date.getDate()
            })
          )
          return interaction.editReply({ embeds: [embed] })
        } else {
          embed.setDescription(
            client.i18n.t('commands.premium.description.premiumdate2', {
              year: nextpay_date.getFullYear(),
              month: nextpay_date.getMonth() + 1,
              date: nextpay_date.getDate()
            })
          )
          return interaction.editReply({ embeds: [embed] })
        }
      }
    },
  },
);
