import config from '../../../config'
import { Collection, Message } from 'discord.js'
import Ticket from '../../schemas/ticketSchema'
import { ButtonInteraction } from '../../structures/Command'
import Embed from '../../utils/Embed'

export default new ButtonInteraction(
  {
    name: 'save'
  },
  async (client, interaction) => {
    await interaction.deferReply({ ephemeral: true })
    const ticket = await Ticket.findOne({
      guildId: interaction.guild?.id,
      channelId: interaction.channel?.id
    })
    const ErrorEmbed = new Embed(client, 'error')
      .setTitle('찾을 수 없는 티켓 정보입니다')
      .setColor('#2f3136')
    if (!ticket) return await interaction.editReply({ embeds: [ErrorEmbed] })
    let messages = new Collection() as any
    let channelMessages = await interaction.channel?.messages.fetch({
      limit: 100
    })
    const LoadingEmbed = new Embed(client, 'info')
      .setTitle('채팅 기록을 불러오는 중입니다')
      .setColor('#2f3136')
    const NoMessageEmbed = new Embed(client, 'error')
      .setTitle('채팅 기록을 불러오지 못했습니다')
      .setColor('#2f3136')
    if (!channelMessages)
      return interaction.editReply({ embeds: [NoMessageEmbed] })
    messages = messages.concat(channelMessages)
    await interaction.editReply({ embeds: [LoadingEmbed] })
    while (channelMessages?.size === 100) {
      channelMessages = await interaction.channel?.messages.fetch({
        limit: 100
      })
      if (channelMessages) messages = messages.concat(channelMessages)
    }
    let MessageDB = [] as any[]
    messages.forEach(async (msg: Message) => {
      MessageDB.push({
        author: msg.author,
        created: msg.createdAt,
        messages: msg.content,
        embed: msg.embeds[0]
      })
    })
    MessageDB = MessageDB.reverse()
    const SaveingEmbed = new Embed(client, 'info')
      .setTitle('채팅 기록을 저장하는 중입니다')
      .setColor('#2f3136')
    await interaction.editReply({ embeds: [SaveingEmbed] })
    await Ticket.updateOne(
      { guildId: interaction.guild?.id, channelId: interaction.channel?.id },
      { $set: { messages: MessageDB } }
    )
    const successembed = new Embed(client, 'success')
      .setTitle('티켓이 저장되었습니다')
      .setDescription(
        `[여기](${config.web?.baseurl}/guilds/${interaction.guild?.id}/ticket/${ticket.ticketId})에서 확인할 수 있습니다`
      )
      .setColor('#2f3136')
    await interaction.editReply({ embeds: [successembed] })
  }
)
