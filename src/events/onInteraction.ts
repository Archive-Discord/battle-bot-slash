import { ChannelType, InteractionType } from 'discord.js';
import ButtonManager from '../managers/ButtonManager';
import CommandManager from '../managers/CommandManager';
import ErrorManager from '../managers/ErrorManager';
import { Event } from '../structures/Event';

export default new Event('interactionCreate', async (client, interaction) => {
  const commandManager = new CommandManager(client);
  const errorManager = new ErrorManager(client);
  const buttonManager = new ButtonManager(client);
  if (interaction.isButton()) {
    if (interaction.user.bot) return;
    if (interaction.channel?.type === ChannelType.DM)
      return interaction.reply('DM으로는 버튼 사용이 불가능해요');
    let button = buttonManager.get(interaction.customId);
    if (interaction.customId.startsWith('role_')) {
      button = buttonManager.get('autorole.add');
    }
    if (interaction.customId.startsWith('vote_')) {
      button = buttonManager.get('vote.select');
    }
    if (!button) return;
    try {
      await button?.execute(client, interaction);
    } catch (error: any) {
      errorManager.report(error, { executer: undefined, isSend: false });
    }
  }

  if (interaction.user.bot) return;
  if (interaction.channel?.type === ChannelType.DM) return;

  if (interaction.isButton()) {
    if (interaction.user.bot) return;
    let button = buttonManager.get(interaction.customId);
    if (interaction.customId.startsWith('role_')) {
      button = buttonManager.get('autorole.add');
    }
    if (interaction.customId.startsWith('vote_')) {
      button = buttonManager.get('vote.select');
    }
    if (!button) return;
    try {
      await button?.execute(client, interaction);
    } catch (error: any) {
      errorManager.report(error, { executer: undefined, isSend: false });
    }
  }

  if (interaction.isChatInputCommand()) {
    if (interaction.user.bot) return;

    const command = commandManager.get(interaction.commandName);
    try {
      if (commandManager.isSlash(command)) {
        command.slash
          ? await command.slash.execute(client, interaction)
          : await command.execute(client, interaction);
      }
      //await interaction.deferReply().catch(() => { })
    } catch (error: any) {
      errorManager.report(error, { executer: interaction, isSend: true });
    }
  }

  if (interaction.type === InteractionType.ApplicationCommandAutocomplete) {
    if (interaction.commandName === '도움말') {
      const focusedValue = interaction.options.getFocused();
      const choices = client.categorys;

      const filtered = choices.filter((command, choice) => choice.startsWith(focusedValue));

      await interaction.respond(
        filtered.map((command, choice) => ({ name: choice, value: choice })),
      );
    }
  }
});
