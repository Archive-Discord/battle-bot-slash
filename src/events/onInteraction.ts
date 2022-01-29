import BotClient from '@client'
import { Interaction } from 'discord.js'
import ButtonManager from '../managers/ButtonManager'
import CommandManager from '../managers/CommandManager'
import ErrorManager from '../managers/ErrorManager'

export default {
	name: 'interactionCreate',
	async execute(client: BotClient, interaction: Interaction) {
		const commandManager = new CommandManager(client)
		const buttonManager = new ButtonManager(client)
		const errorManager = new ErrorManager(client)
		if (interaction.isButton()) {
			if (interaction.user.bot) return
			if (!interaction.channel) return
			const button = buttonManager.get(interaction.customId)
			if (!button) return

			try {
				await button?.execute(client, interaction)
			} catch (error) {
				errorManager.report(error as Error, {
					executer: interaction
				})
			}
		}

		if (interaction.isCommand()) {
			if (interaction.user.bot) return
			if (interaction.channel?.type === 'DM')
				return interaction.reply('DM으로는 명령어 사용이 불가능해요')

			const command = commandManager.get(interaction.commandName) as any

			try {
				command?.isSlash
					? await command.execute(client, interaction)
					: await command?.slash.execute(client, interaction)
			} catch (error: any) {
				errorManager.report(error, {
					executer: interaction,
					isSend: true
				})
			}
		}
	},
}
