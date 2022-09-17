import { BaseCommand, SlashCommand } from '../../structures/Command'
import Discord from 'discord.js'
import Embed from '../../utils/Embed'
import comma from 'comma-number'
import Schema from '../../schemas/Money'
import { SlashCommandBuilder, userMention } from '@discordjs/builders'

export default new BaseCommand(
  {
    name: 'wallet',
    description: '자신의 돈을 확인합니다.',
    aliases: ['잔액', 'money', 'ehs', 'wlrkq', '지갑', '돈']
  },
  async (client, message, args) => {
    let embed = new Embed(client, 'warn')
      .setTitle(client.i18n.t('main.title.loading'))
      .setColor('#2f3136')
    let m = await message.reply({
      embeds: [embed]
    })
    const user =
      message.mentions.users.first() ||
      client.users.cache.get(args[0]) ||
      message.author
    const wjdqh = await Schema.findOne({ userid: user.id })
    embed = new Embed(client, 'success')
      .setTitle(client.i18n.t('main.title.error'))
      .setDescription(
        client.i18n.t('commands.wallet.description.account', {
          author: user
        })
      )
      .setColor('#2f3136')
    if (!wjdqh)
      return m.edit({
        embeds: [embed]
      })
    const t = new Date()
    const date = '' + t.getFullYear() + t.getMonth() + t.getDate()
    let i
    if (wjdqh.date == date) i = '돈을 받음'
    else i = '돈을 받지않음'
    embed = new Embed(client, 'success')
      .setTitle(
        client.i18n.t('commands.wallet.title.have', {
          tag: user.tag
        })
      )
      .setDescription(client.i18n.t('commands.wallet.description.have'))
      .addFields({
        name: client.i18n.t('commands.wallet.fields.name'),
        value: client.i18n.t('commands.wallet.fields.value', {
          m: comma(wjdqh.money)
        })
      })
      .setColor('#2f3136')
    m.edit({
      embeds: [embed]
    })
  },
  {
    // @ts-ignore
    data: new SlashCommandBuilder()
      .setName('돈')
      .setDescription('자신의 돈을 확인합니다.')
      .addUserOption((option) =>
        option
          .setName('유저')
          .setDescription('확인할 유저를 입력해주세요.')
          .setRequired(false)
      ),
    options: {
      name: '돈',
      isSlash: true
    },
    async execute(client, interaction) {
      await interaction.deferReply({ ephemeral: true })
      let user = interaction.options.getUser('유저') || interaction.user
      const wjdqh = await Schema.findOne({ userid: user.id })
      let embed = new Embed(client, 'success')
        .setTitle(client.i18n.t('main.title.error'))
        .setDescription(
          client.i18n.t('commands.wallet.description.account', {
            author: user
          })
        )
        .setColor('#2f3136')

      if (!wjdqh)
        return interaction.editReply({
          embeds: [embed]
        })
      const t = new Date()
      const date = '' + t.getFullYear() + t.getMonth() + t.getDate()
      let i
      if (wjdqh.date == date) i = '돈을 받음'
      else i = '돈을 받지않음'
      embed = new Embed(client, 'success')
        .setTitle(
          client.i18n.t('commands.wallet.title.have', {
            tag: user.tag
          })
        )
        .setDescription(client.i18n.t('commands.wallet.description.have'))
        .addFields({
          name: client.i18n.t('commands.wallet.fields.name'),
          value: client.i18n.t('commands.wallet.fields.value', {
            m: comma(wjdqh.money)
          })
        })
        .setColor('#2f3136')
      interaction.editReply({
        embeds: [embed]
      })
    }
  }
)
