import Discord ,{ Guild, GuildAuditLogs, GuildAuditLogsEntry, GuildChannel, TextChannel, User } from 'discord.js'
import CommandManager from 'src/managers/CommandManager'
import ErrorManager from 'src/managers/ErrorManager'
import LoggerSetting from 'src/schemas/LogSettingSchema'
import Embed from 'src/utils/Embed'
import Logger from 'src/utils/Logger'
import { Event } from '../structures/Event'
const log = new Logger('GuildCreateEvent')
export default new Event('inviteDelete', async (client, invite) => {
  let guild = invite.guild as Guild
  let LoggerSettingDB = await LoggerSetting.findOne({guild_id: guild.id})
  if(!LoggerSettingDB) return
  if(!LoggerSettingDB.useing.inviteGuild) return
  let logChannel = guild.channels.cache.get(LoggerSettingDB.guild_channel_id) as TextChannel
  if(!logChannel) return
  let embed = new Embed(client, 'error')
    .setTitle('초대코드 삭제')
    .addField(`초대코드`, invite.code)
  return await logChannel.send({embeds: [embed]})
})
