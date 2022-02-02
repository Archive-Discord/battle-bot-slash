import BotClient from "@client"

import { Client, GuildMember } from 'discord.js'
import LoggerSetting from '../schemas/LogSettingSchema'
import LogEmbed from '../utils/LogEmbed'



module.exports = {
	name: 'guildMemberAdd',
	/**
	 * 
	 * @param {import('../structures/BotClient')} client 
	 * @param {GuildMember} member 
	 */
	async execute(client: BotClient, member: GuildMember) {
		const LoggerSettingDB = await LoggerSetting.findOne({ guild_id: member.guild.id })
		if (!LoggerSettingDB) return
		if (!LoggerSettingDB.useing.memberJoin) return
		const logChannel = member.guild.channels.cache.get(LoggerSettingDB.guild_channel_id)
		if (!logChannel) return
		const embed = new LogEmbed(client as Client<true>, 'success')
			.setDescription('멤버 추가')
			.setAuthor({ name: member.user.username, iconURL: member.user.displayAvatarURL() })
			.addFields({
				name: '유저',
				value: `<@${member.user.id}>` + '(`' + member.user.id + '`)'
			})
		return await logChannel.send({ embeds: [embed] })
	}
}
