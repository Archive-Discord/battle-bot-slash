import ButtonManager from"../managers/ButtonManager")
import CommandManager from"../managers/CommandManager")
import ErrorManager from"../managers/ErrorManager")

export default {
  name: "interactionCreate",
  /**
   *
   * @param {import('../structures/BotClient')} client
   * @param {import('discord.js').Interaction} interaction
   */
  async execute(client, interaction) {
    let commandManager = new CommandManager(client)
    let buttonManager = new ButtonManager(client)
    let errorManager = new ErrorManager(client)
    if (interaction.isButton()) {
      if (interaction.user.bot) return
      if (interaction.channel.type === "DM")
        return interaction.reply("DM으로는 버튼 사용이 불가능해요")
      let button = buttonManager.get(interaction.customId)
      if (!button) return

      try {
        await button?.execute(client, interaction)
      } catch (error) {
        errorManager.report(error, interaction)
      }
    }

    if (interaction.isCommand()) {
      if (interaction.user.bot) return
      if (interaction.channel.type === "DM")
        return interaction.reply("DM으로는 명령어 사용이 불가능해요")

      let command = commandManager.get(interaction.commandName)

      try {
        command?.isSlash
          ? await command.execute(client, interaction)
          : await command?.slash.execute(client, interaction)
      } catch (error) {
        errorManager.report(error, interaction)
      }
    }
  },
}
