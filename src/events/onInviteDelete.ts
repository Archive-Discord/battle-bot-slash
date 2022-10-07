import { Guild, TextChannel } from 'discord.js';
import LoggerSetting from '../schemas/LogSettingSchema';
import Embed from '../utils/Embed';
import { Event } from '../structures/Event';

export default new Event('inviteDelete', async (client, invite) => {
  const guild = invite.guild as Guild;
  const LoggerSettingDB = await LoggerSetting.findOne({ guild_id: guild.id });
  if (!LoggerSettingDB) return;
  if (!LoggerSettingDB.useing.inviteGuild) return;
  const logChannel = guild.channels.cache.get(LoggerSettingDB.guild_channel_id) as TextChannel;
  if (!logChannel) return;
  const embed = new Embed(client, 'error')
    .setTitle('초대코드 삭제')
    .addFields({ name: `초대코드`, value: invite.code })
  return await logChannel.send({ embeds: [embed] })
})
