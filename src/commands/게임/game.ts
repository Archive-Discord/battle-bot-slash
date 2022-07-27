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
      .setTitle(`❌ 에러 발생`)
      .setDescription(
        '해당 명령어는 슬래쉬 커맨드 ( / )로만 사용이 가능합니다.'
      )
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
      const embed = new Embed(client, 'error').setTitle(`❌ 에러 발생`)
      const embedSuccess = new Embed(client, 'success')
        .setTitle(`🎮 게임`)
        .setColor('#2f3136')
      const guild = interaction.guild
      if (!guild) {
        embed.setDescription('이 명령어는 서버에서만 사용이 가능합니다.')
        return interaction.reply({ embeds: [embed], ephemeral: true })
      }
      const member = guild.members.cache.get(interaction.user.id)
      if (!member) {
        embed.setDescription('서버에서 유저를 찾지 못했습니다.')
        return interaction.reply({ embeds: [embed], ephemeral: true })
      }
      if (!member.voice || !member.voice.channel) {
        embed.setDescription(`먼저 음성채널에 입장해주세요.`)
        return interaction.reply({ embeds: [embed], ephemeral: true })
      }
      if (member.voice.channel.type === ChannelType.GuildStageVoice) {
        embed.setDescription(
          `스테이지 채널에서는 이 명령어를 사용할 수 없습니다.`
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
          embed.setDescription(`초대코드를 생성하지 못했습니다.`)
          return interaction.reply({ embeds: [embed], ephemeral: true })
        }
        embedSuccess.setDescription(
          `성공적으로 게임코드가 생성되었었습니다.\n**초대코드가 활성화 되지 않을 경우 링크를 눌러주세요.**`
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
          embed.setDescription(`초대코드를 생성하지 못했습니다.`)
          return interaction.reply({ embeds: [embed] })
        }
        embedSuccess.setDescription(
          `성공적으로 게임코드가 생성되었습니다.\n**초대코드가 활성화 되지 않을 경우 링크를 눌러주세요.**`
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
          embed.setDescription(`초대코드를 생성하지 못했습니다.`)
          return interaction.reply({ embeds: [embed], ephemeral: true })
        }
        embedSuccess.setDescription(
          `성공적으로 게임코드가 생성되었습니다.\n**초대코드가 활성화 되지 않을 경우 링크를 눌러주세요.**`
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
          embed.setDescription(`초대코드를 생성하지 못했습니다.`)
          return interaction.reply({ embeds: [embed], ephemeral: true })
        }
        embedSuccess.setDescription(
          `성공적으로 게임코드가 생성되었습니다.\n**초대코드가 활성화 되지 않을 경우 링크를 눌러주세요.**`
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
          embed.setDescription(`초대코드를 생성하지 못했습니다.`)
          return interaction.reply({ embeds: [embed], ephemeral: true })
        }
        embedSuccess.setDescription(
          `성공적으로 게임코드가 생성되었습니다.\n**초대코드가 활성화 되지 않을 경우 링크를 눌러주세요.**`
        )
        return interaction.reply({
          embeds: [embedSuccess],
          content: `https://discord.gg/${invite.code}`,
          ephemeral: true
        })
      } else {
        embed.setDescription('찾을 수 없는 게임 입니다.')
        return interaction.reply({ embeds: [embed], ephemeral: true })
      }
    }
  }
)
