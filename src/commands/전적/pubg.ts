import { BaseCommand } from '../../structures/Command'
import { playerStats } from '../../utils/pubg'
import { SlashCommandBuilder } from '@discordjs/builders'

export default new BaseCommand(
  {
    name: '배그전적',
    description: '배틀그라운드 전적을 확인합니다.',
    aliases: ['전적배그', 'pubgstat']
  },
  async (client, message, args) => {
    return message.reply(
      `해당 명령어는 슬래쉬 커맨드 ( / )로만 사용이 가능합니다.`
    )
  },
  {
    // @ts-ignore
    data: new SlashCommandBuilder()
      .setName('배그전적')
      .setDescription('유저의 배틀그라운드 전적을 확인합니다')
      .addStringOption((user) =>
        user
          .setName('user')
          .setDescription('배틀그라운드 닉네임을 적어주세요')
          .setRequired(true)
      )
      .addStringOption((mode) =>
        mode
          .setName('mode')
          .setDescription('검색할 모드를 선택해주세요')
          .setRequired(true)
          .addChoices(
            { name: '3인칭', value: 'tpp' },
            { name: '1인칭', value: 'fpp' },
            { name: '3인칭 (경쟁)', value: 'tpprank' },
            { name: '1인칭 (경쟁)', value: 'fpprank' }
          )
      ),
    options: {
      name: '배그전적',
      isSlash: true
    },
    async execute(client, interaction) {
      await interaction.deferReply({ ephemeral: true })
      let nickname = interaction.options.getString('user', true)
      let mode = interaction.options.getString('mode', true)
      return await playerStats(nickname, mode, interaction)
    }
  }
)
