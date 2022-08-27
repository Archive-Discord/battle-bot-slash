import { SlashCommandBuilder } from '@discordjs/builders'
import { ChannelType, Invite } from 'discord.js'
import { REST } from '@discordjs/rest'
import { BaseCommand } from '../../structures/Command'
import Embed from '../../utils/Embed'
import config from '../../../config'

export default new BaseCommand(
  {
    name: 'youtube',
    description: '디스코드에서 유튜브를 같이 볼 수 있습니다.',
    aliases: ['유튜브', 'dbxbqm', '유튜브보기', '유튜브보기용', '유튭']
  },
  async (client, message, args) => {
    let embed = new Embed(client, 'error')
      .setTitle(client.i18n.t('main.title.error'))
      .setDescription(client.i18n.t('main.descriptio.slashcommand'))
    return message.reply({ embeds: [embed] })
  },
  {
    // @ts-ignore
    data: new SlashCommandBuilder()
      .setName('유튜브')
      .setDescription('디스코드에서 유튜브를 같이 볼 수 있습니다.'),
    options: {
      name: '유튜브',
      isSlash: true
    },
    async execute(client, interaction) {
      const embed = new Embed(client, 'error')
        .setTitle(client.i18n.t('main.title.error'))
        .setColor('#2f3136')
      const embedSuccess = new Embed(client, 'success')
        .setTitle(client.i18n.t('commands.youtube.title'))
        .setColor('#2f3136')
      const guild = interaction.guild
      if (!guild) {
        embed.setDescription(client.i18n.t('commands.game.description.server'))
        return interaction.reply({ embeds: [embed], ephemeral: true })
      }
      const member = guild.members.cache.get(interaction.user.id)
      if (!member) {
        embed.setDescription(client.i18n.t('commands.game.description.member'))
        return interaction.reply({ embeds: [embed], ephemeral: true })
      }
      if (!member.voice || !member.voice.channel) {
        embed.setDescription(client.i18n.t('commands.game.description.voice'))
        return interaction.reply({ embeds: [embed], ephemeral: true })
      }
      if (member.voice.channel.type === ChannelType.GuildStageVoice) {
        embed.setDescription(client.i18n.t('commands.game.description.stage'))
        return interaction.reply({ embeds: [embed], ephemeral: true })
      }
      const rest = new REST({ version: '8' }).setToken(config.bot.token)
      const invite: Invite = (await rest.post(
        `/channels/${member.voice.channelId}/invites`,
        {
          body: {
            max_age: 86400,
            max_uses: 0,
            target_application_id: '880218394199220334',
            target_type: 2,
            temporary: false,
            validate: null
          }
        }
      )) as Invite
      if (!invite) {
        embed.setDescription(client.i18n.t('commands.youtube.description.fail'))
        return interaction.reply({ embeds: [embed], ephemeral: true })
      }
      embedSuccess.setDescription(
        client.i18n.t('commands.youtube.description.success')
      )
      return interaction.reply({
        embeds: [embedSuccess],
        content: `https://discord.gg/${invite.code}`,
        ephemeral: true
      })
    }
  }
)
