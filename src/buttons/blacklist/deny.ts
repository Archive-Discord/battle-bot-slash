import Blacklist from "src/schemas/blacklistSchemas"
import Ticket from "src/schemas/ticketSchema"
import { BaseButton } from "src/structures/Command"
import Embed from "src/utils/Embed"

export default new BaseButton({
  name: 'blacklist.accept ',
},async (client, interaction) => {
  await interaction.deferReply({ephemeral: true})
  // @ts-ignore
  if(!client.dokdo.owners.includes(interaction.user.id)) return interaction.editReply(`해당 명령어는 ${client.user.username}의 주인이 사용할 수 있는 명령어입니다.`)
  let blacklist = await Blacklist.findOne({message: interaction.message.id, status: 'pending'})
  if(!blacklist) return interaction.editReply({embeds: [new Embed(client, 'warn').setDescription('이미 처리가 완료된 블랙리스트입니다')]})
  await Blacklist.updateOne({message: interaction.message.id}, {$set: {status: 'deny'}})
  return interaction.editReply({embeds: [new Embed(client, 'success').setDescription('성공적으로 거절이 완료되었습니다')]})
})