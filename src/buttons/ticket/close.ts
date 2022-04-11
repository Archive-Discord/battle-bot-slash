import Ticket from '../../schemas/ticketSchema'
import { ButtonInteraction } from '../../structures/Command'
import Embed from '../../utils/Embed'
import { GuildChannel, MessageActionRow, MessageButton } from 'discord.js'
export default new ButtonInteraction(
  {
    name: 'close'
  },
  async (client, interaction) => {
    await interaction.deferReply({ ephemeral: true })
    const replyTicket = new Embed(client, 'info').setDescription(
      `5초뒤에 티켓이 종료됩니다!,  <@!${interaction.user.id}>`
    )
    await interaction.editReply({ embeds: [replyTicket] })
    const ticketDB = await Ticket.findOne({
      guildId: interaction.guild?.id,
      channelId: interaction.channel?.id,
      status: 'open'
    })
    if (!ticketDB)
      return await interaction.channel?.send({
        content: '이미 닫힌 티켓이거나 티켓 정보를 찾을 수 없습니다'
      })
    setTimeout(async () => {
      await Ticket.updateOne(
        {
          guildId: interaction.guild?.id,
          channelId: interaction.channel?.id,
          status: 'open'
        },
        { $set: { status: 'close' } }
      )
      const buttonSave = new MessageButton()
        .setLabel('저장')
        .setStyle('SUCCESS')
        .setEmoji('💾')
        .setCustomId('save')
      const buttonDelete = new MessageButton()
        .setLabel('삭제')
        .setStyle('DANGER')
        .setEmoji('🗑')
        .setCustomId('delete')
      const componets = new MessageActionRow()
        .addComponents(buttonSave)
        .addComponents(buttonDelete)
      const replyCloseTicket = new Embed(client, 'info').setDescription(
        `티켓이 종료되었습니다!, <@!${interaction.user.id}>`
      )
      interaction.channelId
      const channel = interaction.guild?.channels.cache.get(
        interaction.channel?.id as string
      ) as GuildChannel
      await channel.permissionOverwrites.edit(ticketDB.userId, {
        VIEW_CHANNEL: false,
        SEND_MESSAGES: false
      })
      channel.setName(`closed-ticket-${ticketDB.ticketId.slice(0, 5)}`)
      interaction.channel?.send({
        embeds: [replyCloseTicket],
        components: [componets]
      })
      return interaction.editReply({
        embeds: [replyCloseTicket],
        components: [componets]
      })
    }, 5000)
  }
)
