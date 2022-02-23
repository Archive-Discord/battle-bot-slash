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
    return message.reply(`해당 명령어는 (/)커멘드로만 사용가능합니다`)
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
        .addChoice('3인칭', 'tpp')
        .addChoice('1인칭', 'fpp')
        .addChoice('3인칭 (경쟁)', 'tpprank')
        .addChoice('1인칭 (경쟁)', 'fpprank'),
  ),
    options: {
      name: '배그전적',
      isSlash: true
    },
    async execute(client, interaction) {
      await interaction.deferReply()
      let nickname = interaction.options.getString('user', true)
      let mode = interaction.options.getString('mode', true)
      return await playerStats(nickname, mode, interaction)
    }
  }
)