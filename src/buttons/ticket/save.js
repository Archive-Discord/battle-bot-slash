const { CommandInteraction, Collection } = require("discord.js") // eslint-disable-line no-unused-vars
const { web } = require("../../../config")
const { Ticket } = require("../../schemas/ticketSchemas")
const Embed = require("../../utils/Embed")

export default {
  name: "save",
  description: "티켓 저장 반응",
  /**
   *
   * @param {import('../../structures/BotClient')} client
   * @param {CommandInteraction} interaction
   */
  async execute(client, interaction) {
    await interaction.deferReply({ ephemeral: true })
    let ticket = await Ticket.findOne({
      guildId: interaction.guild.id,
      channelId: interaction.channel.id,
    })
    let ErrorEmbed = new Embed(client, "error").setTitle(
      "찾을 수 없는 티켓 정보입니다"
    )
    if (!ticket) await interaction.editReply({ embeds: [ErrorEmbed] })
    let messages = new Collection()
    let channelMessages = await interaction.channel.messages.fetch({
      limit: 100,
    })
    let LoadingEmbed = new Embed(client, "info").setTitle(
      "채팅 기록을 불러오는 중입니다"
    )
    messages = messages.concat(channelMessages)
    await interaction.editReply({ embeds: [LoadingEmbed] })
    while (channelMessages.size === 100) {
      let lastMessageId = channelMessages.lastKey()
      channelMessages = await interaction.channel.fetchMessages({
        limit: 100,
        before: lastMessageId,
      })
      if (channelMessages) messages = messages.concat(channelMessages)
    }
    let msgs = messages.reverse()
    let MessageDB = new Array()
    msgs.forEach(async (msg) => {
      MessageDB.push({
        author: msg.author,
        created: msg.createdAt,
        messages: msg.content,
        embed: msg.embeds[0],
      })
    })
    let SaveingEmbed = new Embed(client, "info").setTitle(
      "채팅 기록을 저장하는 중입니다"
    )
    await interaction.editReply({ embeds: [SaveingEmbed] })
    await Ticket.updateOne(
      { guildId: interaction.guild.id, channelId: interaction.channel.id },
      { $set: { messages: MessageDB } }
    )
    let successembed = new Embed(client, "success")
      .setTitle("티켓이 저장되었습니다")
      .setDescription(
        `[여기](${web.baseurl}/guilds/${interaction.guild.id}/ticket/${ticket.ticketId})에서 확인할 수 있습니다`
      )
    await interaction.editReply({ embeds: [successembed] })
  },
}
