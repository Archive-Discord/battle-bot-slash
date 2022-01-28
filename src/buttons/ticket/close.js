const {
  CommandInteraction,
  MessageActionRow,
  MessageButton,
} = require("discord.js") // eslint-disable-line no-unused-vars
const { Ticket } = require("../../schemas/ticketSchemas")
const Embed = require("../../utils/Embed")

export default {
  name: "close",
  description: "티켓 닫기 반응",
  /**
   *
   * @param {import('../../structures/BotClient')} client
   * @param {CommandInteraction} interaction
   */
  async execute(client, interaction) {
    await interaction.deferReply({ ephemeral: true })
    let replyTicket = new Embed(client, "info").setDescription(
      `5초뒤에 티켓이 종료됩니다!,  <@!${interaction.user.id}>`
    )
    await interaction.editReply({ embeds: [replyTicket] })
    let ticketDB = await Ticket.findOne({
      guildId: interaction.guild.id,
      channelId: interaction.channel.id,
      status: "open",
    })
    if (!ticketDB)
      return await interaction.channel.send({
        content: "이미 닫힌 티켓이거나 티켓 정보를 찾을 수 없습니다",
      })
    setTimeout(async () => {
      await Ticket.updateOne(
        {
          guildId: interaction.guild.id,
          channelId: interaction.channel.id,
          status: "open",
        },
        { $set: { status: "close" } }
      )
      let buttonSave = new MessageButton()
        .setLabel("저장")
        .setStyle("SUCCESS")
        .setEmoji("💾")
        .setCustomId("save")
      let buttonDelete = new MessageButton()
        .setLabel("삭제")
        .setStyle("DANGER")
        .setEmoji("🗑")
        .setCustomId("delete")
      let componets = new MessageActionRow()
        .addComponents(buttonSave)
        .addComponents(buttonDelete)
      let replyCloseTicket = new Embed(client, "info").setDescription(
        `티켓이 종료되었습니다!, <@!${interaction.user.id}>`
      )
      interaction.channel.permissionOverwrites.edit(interaction.user.id, {
        VIEW_CHANNEL: false,
      })
      interaction.channel.setName(
        `closed-ticket-${interaction.user.discriminator}`
      )
      interaction.channel.send({
        embeds: [replyCloseTicket],
        components: [componets],
      })
      return interaction.editReply({
        embeds: [replyCloseTicket],
        components: [componets],
      })
    }, 5000)
  },
}
