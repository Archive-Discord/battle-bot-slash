import Ticket from "src/schemas/ticketSchema"
import { BaseButton } from "src/structures/Command"

export default new BaseButton({
  name: 'delete',
},async (client, interaction) => {
  await Ticket.updateOne({guildId: interaction.guild?.id, channelId: interaction.channel?.id}, {$set: {status: 'close'}})
  await interaction.reply({content:'채널을 삭제합니다', ephemeral: true})
  await interaction.channel?.delete()
})