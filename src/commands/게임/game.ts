import { SlashCommandBuilder } from '@discordjs/builders'
import { GuildMember, EmbedBuilder, Invite, ChannelType } from 'discord.js'
import { REST } from '@discordjs/rest'
import { BaseCommand } from '../../structures/Command'
import Embed from '../../utils/Embed'
import mongoose from 'mongoose'
import config from '../../../config'

export default new BaseCommand(
  {
    name: 'game',
    description: '디스코드에서 게임을 플레이합니다.',
    aliases: ['게임']
  },
  async (client, message, args) => {
    let embed = new Embed(client, 'error')
      .setTitle(client.i18n.t('main.error.title'))
      .setDescription(client.i18n.t('main.error.slashcommand'))
      .setColor('#2f3136')
    return message.reply({ embeds: [embed] })
  },
  {
    // @ts-ignore
    data: new SlashCommandBuilder()
      .setName('게임')
      .setDescription('디스코드에서 게임을 플레이 할 수 있어요!')
      .addStringOption((game) =>
        game
          .setName('게임')
          .setDescription('플레이할 게임을 선택해주세요!')
          .setRequired(true)
          .addChoices(
            { name: '포커', value: 'poker' },
            { name: '물고기 잡기', value: 'fishing' },
            { name: '채스', value: 'chess' },
            { name: '캐치마인드', value: 'doodlecrew' },
            { name: '단어만들기', value: 'spellcast' }
          )
      ),
    options: {
      name: '게임',
      isSlash: true
    },
    async execute(client, interaction) {
      const embed = new Embed(client, 'error')
        .setTitle(client.i18n.t('main.error.title'))
        .setColor('#2f3136')
      const embedSuccess = new Embed(client, 'success')
        .setTitle(client.i18n.t('commands.game.title'))
        .setColor('#2f3136')
      const guild = interaction.guild
      if (!guild) {
        embed.setDescription(
          client.i18n.t('commands.game.error.description.server')
        )
        return interaction.reply({ embeds: [embed], ephemeral: true })
      }
      const member = guild.members.cache.get(interaction.user.id)
      if (!member) {
        embed.setDescription(
          client.i18n.t('commands.game.error.description.member')
        )
        return interaction.reply({ embeds: [embed], ephemeral: true })
      }
      if (!member.voice || !member.voice.channel) {
        embed.setDescription(
          client.i18n.t('commands.game.error.description.voice')
        )
        return interaction.reply({ embeds: [embed], ephemeral: true })
      }
      if (member.voice.channel.type === ChannelType.GuildStageVoice) {
        embed.setDescription(
          client.i18n.t('commands.game.error.description.stage')
        )
        return interaction.reply({ embeds: [embed], ephemeral: true })
      }
      const rest = new REST({ version: '8' }).setToken(config.bot.token)
      const game = interaction.options.getString('게임', true)
      if (game === 'poker') {
        const invite: Invite = (await rest.post(
          `/channels/${member.voice.channelId}/invites`,
          {
            body: {
              max_age: 86400,
              max_uses: 0,
              target_application_id: '755827207812677713',
              target_type: 2,
              temporary: false,
              validate: null
            }
          }
        )) as Invite
        if (!invite) {
          embed.setDescription(
            client.i18n.t('commands.game.error.description.invite')
          )
          return interaction.reply({ embeds: [embed], ephemeral: true })
        }
        embedSuccess.setDescription(
          client.i18n.t('commands.game.description.invite')
        )
        return interaction.reply({
          embeds: [embedSuccess],
          content: `https://discord.gg/${invite.code}`,
          ephemeral: true
        })
      } else if (game === 'fishing') {
        const invite: Invite = (await rest.post(
          `/channels/${member.voice.channelId}/invites`,
          {
            body: {
              max_age: 86400,
              max_uses: 0,
              target_application_id: '814288819477020702',
              target_type: 2,
              temporary: false,
              validate: null
            }
          }
        )) as Invite
        if (!invite) {
          embed.setDescription(
            client.i18n.t('commands.game.error.description.invite')
          )
          return interaction.reply({ embeds: [embed] })
        }
        embedSuccess.setDescription(
          client.i18n.t('commands.game.description.invite')
        )
        return interaction.reply({
          embeds: [embedSuccess],
          content: `https://discord.gg/${invite.code}`,
          ephemeral: true
        })
      } else if (game === 'chess') {
        const invite: Invite = (await rest.post(
          `/channels/${member.voice.channelId}/invites`,
          {
            body: {
              max_age: 86400,
              max_uses: 0,
              target_application_id: '832012774040141894',
              target_type: 2,
              temporary: false,
              validate: null
            }
          }
        )) as Invite
        if (!invite) {
          embed.setDescription(
            client.i18n.t('commands.game.error.description.invite')
          )
          return interaction.reply({ embeds: [embed], ephemeral: true })
        }
        embedSuccess.setDescription(
          client.i18n.t('commands.game.description.invite')
        )
        return interaction.reply({
          embeds: [embedSuccess],
          content: `https://discord.gg/${invite.code}`,
          ephemeral: true
        })
      } else if (game === 'doodlecrew') {
        const invite: Invite = (await rest.post(
          `/channels/${member.voice.channelId}/invites`,
          {
            body: {
              max_age: 86400,
              max_uses: 0,
              target_application_id: '878067389634314250',
              target_type: 2,
              temporary: false,
              validate: null
            }
          }
        )) as Invite
        if (!invite) {
          embed.setDescription(
            client.i18n.t('commands.game.error.description.invite')
          )
          return interaction.reply({ embeds: [embed], ephemeral: true })
        }
        embedSuccess.setDescription(
          client.i18n.t('commands.game.description.invite')
        )
        return interaction.reply({
          embeds: [embedSuccess],
          content: `https://discord.gg/${invite.code}`,
          ephemeral: true
        })
      } else if (game === 'spellcast') {
        const invite: Invite = (await rest.post(
          `/channels/${member.voice.channelId}/invites`,
          {
            body: {
              max_age: 86400,
              max_uses: 0,
              target_application_id: '852509694341283871',
              target_type: 2,
              temporary: false,
              validate: null
            }
          }
        )) as Invite
        if (!invite) {
          embed.setDescription(
            client.i18n.t('commands.game.error.description.invite')
          )
          return interaction.reply({ embeds: [embed], ephemeral: true })
        }
        embedSuccess.setDescription(
          client.i18n.t('commands.game.description.invite')
        )
        return interaction.reply({
          embeds: [embedSuccess],
          content: `https://discord.gg/${invite.code}`,
          ephemeral: true
        })
      } else {
        embed.setDescription(
          client.i18n.t('commands.game.error.description.game')
        )
        return interaction.reply({ embeds: [embed], ephemeral: true })
      }
    }
  }
)
