import { Guild, GuildMember, Message } from 'discord.js'
import VerifySetting from '../../schemas/verifySetting'
import { ButtonInteraction } from '../../structures/Command'
import captchaCreate from '../../utils/createCapcha'
import Embed from '../../utils/Embed'
import { anyid } from 'anyid'
import config from '../../../config'
import NFTUserVerify from '../../schemas/NFTUserVerifySchema'

export default new ButtonInteraction(
  {
    name: 'nft.verify'
  },
  async (client, interaction) => {
    await interaction.deferReply({ ephemeral: true })
    const token = anyid()
      .encode('Aa0')
      .bits(48 * 8)
      .random()
      .id()
    const verify = new NFTUserVerify()
    verify.guild_id = interaction.guild?.id as string
    verify.user_id = interaction.user.id
    verify.process = 'pending'
    verify.token = token
    verify.save((err) => {
      if (err) return interaction.editReply('정보 생성중 오류가 발생했습니다')
    })
    const captchaVerify = new Embed(client, 'success')
      .setTitle('NFT 인증')
      .setDescription(
        `[여기](${config.web?.baseurl}/walletverify?token=${token})로 접속하여 인증을 진행해주세요`
      )
      .setColor('#2f3136')
    return await interaction.editReply({ embeds: [captchaVerify] })
  }
)
