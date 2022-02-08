import Blacklist from '../../schemas/blacklistSchemas'
import { ButtonInteraction } from '../../structures/Command'
import Embed from '../../utils/Embed'

export default new ButtonInteraction(
  {
    name: 'blacklist.accept'
  },
  async (client, interaction) => {
    await interaction.deferReply({ ephemeral: true })
    // @ts-ignore
    if (!client.dokdo.owners.includes(interaction.user.id))
      return interaction.editReply(
        `해당 명령어는 ${client.user?.username}의 주인이 사용할 수 있는 명령어입니다.`
      )
    const blacklist = await Blacklist.findOne({
      message: interaction.message.id,
      status: 'pending'
    })
    if (!blacklist)
      return interaction.editReply({
        embeds: [
          new Embed(client, 'warn').setDescription(
            '이미 처리가 완료된 블랙리스트입니다'
          )
        ]
      })
    await Blacklist.updateOne(
      { message: interaction.message.id },
      { $set: { status: 'blocked' } }
    )
    return interaction.editReply({
      embeds: [
        new Embed(client, 'success').setDescription(
          '성공적으로 승인이 완료되었습니다'
        )
      ]
    })
  }
)
