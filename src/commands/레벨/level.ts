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
    return message.reply('\`/레벨\` 명령어를 이용해주세요')
  },
  {
    data: new SlashCommandBuilder()
    .setName('레벨')
    .addUserOption(option =>
      option
        .setName("유저")
        .setDescription("확인할 유저를 입력해주세요")
        .setRequired(false)
    )
    .setDescription('유저의 레벨 정보를 확인합니다.'),
    options: {
      name: '레벨',
      isSlash: true
    },
    async execute(client, interaction) {
      await interaction.deferReply()
      let errEmbed = new Embed(client, 'error')
      let successEmbed = new Embed(client, 'success')
      let user = interaction.options.getUser('유저', false)
      const isPremium = await checkUserPremium(client, interaction.user)
      if(!interaction.guild) {
        errEmbed.setDescription('이 명령어는 서버에서만 사용 가능합니다')
        return interaction.editReply({embeds: [errEmbed]})
      }
      if(!user) {
        const levelDB = await Level.findOne({guild_id: interaction.guild.id, user_id: interaction.user.id})
        if(!levelDB) {
          successEmbed.setTitle(`${interaction.user.username}님의 레벨 정보`)
          successEmbed.setColor('#2f3136')
          successEmbed.setDescription(`현재 \`LV.0\`입니다. 다음 레벨까지 \`0XP / 15XP\` 남았습니다.\n
          ${isPremium? "**배틀이 프리미엄으로 30% 경험치 부스터가 적용되었어요**" : `**[여기](${config.web.baseurl}/premium)에서 프리미엄을 사용하시면 레벨 30% 부스터를 사용할 수 있어요!**`}`)
          return interaction.editReply({embeds: [successEmbed]})
        } else {
          successEmbed.setTitle(`${interaction.user.username}님의 레벨 정보`)
          successEmbed.setColor('#2f3136')
          successEmbed.setDescription(`현재 \`LV.${levelDB.level ? levelDB.level : 0}\`입니다. 다음 레벨까지 \`${levelDB.currentXP.toFixed(1)}XP / ${(!levelDB.level ? 1 : levelDB.level + 1) * 13}XP\` 남았습니다.\n
          ${isPremium? "**배틀이 프리미엄으로 30% 경험치 부스터가 적용되었어요**" : `**[여기](${config.web.baseurl}/premium)에서 프리미엄을 사용하시면 레벨 30% 부스터를 사용할 수 있어요!**`}`)
          return interaction.editReply({embeds: [successEmbed]})
        }
      } else {
        const levelDB = await Level.findOne({guild_id: interaction.guild.id, user_id: user.id})
        if(!levelDB) {
          successEmbed.setTitle(`${user.username}님의 레벨 정보`)
          successEmbed.setColor('#2f3136')
          successEmbed.setDescription(`현재 \`LV.0\`입니다. 다음 레벨까지 \`0XP / 15XP\` 남았습니다.`)
          return interaction.editReply({embeds: [successEmbed]})
        } else {
          successEmbed.setTitle(`${user.username}님의 레벨 정보`)
          successEmbed.setColor('#2f3136')
          successEmbed.setDescription(`현재 \`LV.${levelDB.level ? levelDB.level : 0}\`입니다. 다음 레벨까지 \`${levelDB.currentXP.toFixed(1)}XP / ${(!levelDB.level ? 1 : levelDB.level + 1) * 13}XP\` 남았습니다.`)
          return interaction.editReply({embeds: [successEmbed]})
        }
      }
    }
  }
)

