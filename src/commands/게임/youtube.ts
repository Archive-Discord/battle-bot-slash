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
      .setTitle(`❌ 에러 발생`)
      .setDescription(
        '해당 명령어는 슬래쉬 커맨드 ( / )로만 사용이 가능합니다.'
      )
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
      const embed = new Embed(client, 'error').setTitle(`❌ 에러 발생`)
      const embedSuccess = new Embed(client, 'success')
        .setTitle(`유튜브`)
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
        embed.setDescription(`초대코드를 생성하지 못했습니다.`)
        return interaction.reply({ embeds: [embed], ephemeral: true })
      }
      embedSuccess.setDescription(
        `성공적으로 유튜브같이 보기가 생성되었습니다.\n**초대코드가 활성화 되지 않을 경우 링크를 눌러주세요.**`
      )
      return interaction.reply({
        embeds: [embedSuccess],
        content: `https://discord.gg/${invite.code}`,
        ephemeral: true
      })
    }
  }
)
