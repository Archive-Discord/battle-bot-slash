import { BaseCommand, SlashCommand } from '../../structures/Command';
import UserDB from '../../schemas/userSchema';
import Embed from '../../utils/Embed';
import { SlashCommandBuilder, userMention } from '@discordjs/builders';
import DateFormatting from '../../utils/DateFormatting';

export default new BaseCommand(
  {
    name: 'profile',
    description: '유저의 정보를 확인합니다.',
    aliases: ['프로필', 'vmfhvlf', 'vmfhvlf'],
  },
  async (client, message, args) => {
    if (!message.guild) {
      let embed = new Embed(client, 'error')
      embed.setTitle(client.i18n.t('main.title.error'))
      embed.setDescription(client.i18n.t('main.description.slashcommand'))
      embed.setColor('#2f3136')
      return message.reply({ embeds: [embed] })
    }
    if (!args[0]) args[0] = message.author.id
    let user = message.guild.members.cache.get(args[0])
    if (message.mentions.users.first())
      user = message.guild.members.cache.get(
        message.mentions.users.first()?.id as string
      )
    if (!user) {
      let embed = new Embed(client, 'error')
      embed.setTitle(client.i18n.t('main.title.error'))
      embed.setDescription(
        client.i18n.t('commands.profile.description.notfound')
      )
      embed.setColor('#2f3136')
      return message.reply({ embeds: [embed] })
    }
    let userdb = await UserDB.findOne({ id: user.id })
    let embed = new Embed(client, 'success')
      .setTitle(
        client.i18n.t('commands.profile.title.userinfo', {
          username: user.user.username
        })
      )
      .setThumbnail(user.displayAvatarURL())
      .addFields({
        name: client.i18n.t('commands.profile.fields.user'),
        value: userMention(user.id),
        inline: true
      })
      .addFields({
        name: client.i18n.t('commands.profile.fields.id'),
        value: `\`${user.id}\``,
        inline: true
      })
      .addFields({
        name: client.i18n.t('commands.profile.fields.status'),
        value: user.presence
          ? user.presence.activities.length === 0
            ? client.i18n.t('commands.profile.fields.statusv1')
            : user.presence.activities.join(', ')
          : client.i18n.t('commands.profile.fields.statusv2'),
        inline: true
      })
      .addFields({
        name: client.i18n.t('commands.profile.fields.serverjoin'),
        value: DateFormatting._format(user.joinedAt as Date, ''),
        inline: true
      })
      .addFields({
        name: client.i18n.t('commands.profile.fields.accountcreate'),
        value: DateFormatting._format(user.user.createdAt as Date, ''),
        inline: true
      })
      .addFields({
        name: client.i18n.t('commands.profile.fields.webjoin', {
          username: client.user?.username
        }),
        value: userdb
          ? DateFormatting._format(userdb.published_date, '')
          : client.i18n.t('commands.profile.fields.webjoinv')
      })
      .setColor('#2f3136')
    return message.reply({ embeds: [embed] })
  },
  {
    data: new SlashCommandBuilder()
      .setName('프로필')
      .addUserOption((option) =>
        option
          .setName('user')
          .setDescription('프로필을 확인할 유저를 선택합니다')
          .setRequired(true)
      )
      .setDescription('유저의 프로필을 확인합니다'),
    options: {
      name: '프로필',
      isSlash: true,
    },
    async execute(client, interaction) {
      if (!interaction.guild) {
        let embed = new Embed(client, 'error')
        embed.setTitle(client.i18n.t('main.title.error'))
        embed.setDescription(client.i18n.t('main.description.slashcommand'))
        embed.setColor('#2f3136')
        return interaction.reply({ embeds: [embed], ephemeral: true })
      }
      let seluser = interaction.options.getUser('user')
      let user = interaction.guild.members.cache.get(seluser?.id as string)
      if (!user) {
        let embed = new Embed(client, 'error')
        embed.setTitle(client.i18n.t('main.title.error'))
        embed.setDescription(
          client.i18n.t('commands.profile.description.notfound')
        )
        embed.setColor('#2f3136')
        return interaction.reply({ embeds: [embed] })
      }
      let userdb = await UserDB.findOne({ id: user.id })

      let embed = new Embed(client, 'success')
        .setTitle(
          client.i18n.t('commands.profile.title.userinfo', {
            username: user.user.username
          })
        )
        .setThumbnail(user.displayAvatarURL())
        .addFields({
          name: client.i18n.t('commands.profile.fields.user'),
          value: userMention(user.id),
          inline: true
        })
        .addFields({
          name: client.i18n.t('commands.profile.fields.id'),
          value: `\`${user.id}\``,
          inline: true
        })
        .addFields({
          name: client.i18n.t('commands.profile.fields.status'),
          value: user.presence
            ? user.presence.activities.length === 0
              ? client.i18n.t('commands.profile.fields.statusv1')
              : user.presence.activities.join(', ')
            : client.i18n.t('commands.profile.fields.statusv2'),
          inline: true
        })
        .addFields({
          name: client.i18n.t('commands.profile.fields.serverjoin'),
          value: DateFormatting._format(user.joinedAt as Date, ''),
          inline: true
        })
        .addFields({
          name: client.i18n.t('commands.profile.fields.accountcreate'),
          value: DateFormatting._format(user.user.createdAt as Date, ''),
          inline: true
        })
        .addFields({
          name: client.i18n.t('commands.profile.fields.webjoin', {
            username: client.user?.username
          }),
          value: userdb
            ? DateFormatting._format(userdb.published_date, '')
            : client.i18n.t('commands.profile.fields.webjoinv')
        })
        .setColor('#2f3136')
      return interaction.reply({ embeds: [embed] })
    }
  }
)
