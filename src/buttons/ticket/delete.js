const { CommandInteraction } = require("discord.js") // eslint-disable-line no-unused-vars
const { Ticket } = require("../../schemas/ticketSchemas")

export default {
  name: "delete",
  description: "티켓 삭제 반응",
  /**
   *
   * @param {import('../../structures/BotClient')} client
   * @param {CommandInteraction} interaction
   */
  async execute(client, interaction) {
    await Ticket.updateOne(
      { guildId: interaction.guild.id, channelId: interaction.channel.id },
      { $set: { status: "close" } }
    )
    await interaction.reply({ content: "채널을 삭제합니다", ephemeral: true })
    await interaction.channel.delete()
  },
}
