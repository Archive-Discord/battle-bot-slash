import { BaseCommand, SlashCommand } from '../../structures/Command'
import UserDB from '../../schemas/userSchema'
import Embed from '../../utils/Embed'
import { SlashCommandBuilder, userMention } from '@discordjs/builders'
import DateFormatting from '../../utils/DateFormatting'
import Level from '../../schemas/levelSchema'
import config from '../../../config'
import { checkUserPremium } from '../../utils/checkPremium'

export default new BaseCommand(
  {
    name: 'level',
    description: '유저의 레벨 정보를 확인합니다.',
    aliases: ['레벨', 'fpqpf']
  },
  async (client, message, args) => {
    let embed = new Embed(client, 'error')
      .setTitle(client.i18n.t('main.title.error'))
      .setDescription(client.i18n.t('main.description.slashcommand'))
      .setColor('#2f3136')
    return message.reply({ embeds: [embed] })
  },
  {
    data: new SlashCommandBuilder()
      .setName('레벨')
      .addUserOption((option) =>
        option
          .setName('유저')
          .setDescription('확인할 유저를 입력해주세요.')
          .setRequired(false)
      )
      .setDescription('유저의 레벨 정보를 확인합니다.'),
    options: {
      name: '레벨',
      isSlash: true
    },
    async execute(client, interaction) {
      await interaction.deferReply({ ephemeral: true })
      let errEmbed = new Embed(client, 'error').setColor('#2f3136')
      let successEmbed = new Embed(client, 'success').setColor('#2f3136')
      let user = interaction.options.getUser('유저', false)
      const isPremium = await checkUserPremium(client, interaction.user)
      if (!interaction.guild) {
        errEmbed.setTitle(client.i18n.t('main.title.error'))
        errEmbed.setDescription(client.i18n.t('main.description.onlyserver'))
        return interaction.editReply({ embeds: [errEmbed] })
      }
      if (!user) {
        const levelDB = await Level.findOne({
          guild_id: interaction.guild.id,
          user_id: interaction.user.id
        })
        if (!levelDB) {
          successEmbed.setTitle(
            client.i18n.t('commands.level.title.levelinfo', {
              username: interaction.user.username
            })
          )
          successEmbed.setDescription(
            client.i18n.t('commands.level.description.noaccept')
          )
          return interaction.editReply({ embeds: [successEmbed] })
        } else {
          successEmbed.setTitle(
            client.i18n.t('commands.level.title.levelinfo', {
              username: interaction.user.username
            })
          )
          successEmbed.setDescription(
            client.i18n.t('commands.level.description.nextlevel', {
              level: levelDB.level ? levelDB.level : 0,
              nxp: levelDB.currentXP.toFixed(1),
              fxp: (!levelDB.level ? 1 : levelDB.level + 1) * 13
            })
          )
          return interaction.editReply({ embeds: [successEmbed] })
        }
      } else {
        const levelDB = await Level.findOne({
          guild_id: interaction.guild.id,
          user_id: user.id
        })
        if (!levelDB) {
          successEmbed.setTitle(
            client.i18n.t('commands.level.title.levelinfo', {
              username: user.username
            })
          )
          successEmbed.setDescription(
            client.i18n.t('commands.level.description.new')
          )
          return interaction.editReply({ embeds: [successEmbed] })
        } else {
          successEmbed.setTitle(
            client.i18n.t('commands.level.title.levelinfo', {
              username: user.username
            })
          )
          successEmbed.setDescription(
            client.i18n.t('commands.level.description.nextlevel', {
              level: levelDB.level ? levelDB.level : 0,
              nxp: levelDB.currentXP.toFixed(1),
              fxp: (!levelDB.level ? 1 : levelDB.level + 1) * 13
            })
          )
          return interaction.editReply({ embeds: [successEmbed] })
        }
      }
    }
  }
)
