const { CommandInteraction} = require('discord.js') // eslint-disable-line no-unused-vars

module.exports = {
  name: 'delete',
  description: '티켓 삭제 반응',
  /**
   *
   * @param {import('../../structures/BotClient')} client
   * @param {CommandInteraction} interaction
   */
  async execute(client, interaction) {
    await interaction.reply({content:'채널을 삭제합니다', ephemeral: true})
    await interaction.channel.delete()
  },
}
