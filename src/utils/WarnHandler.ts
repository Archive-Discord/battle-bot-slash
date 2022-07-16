import {
  CommandInteraction,
  GuildTextBasedChannel,
  TextChannel
} from 'discord.js'
import LoggerSetting from '../schemas/LogSettingSchema'
import Warning from '../schemas/Warning'
import BotClient from '../structures/BotClient'
import Embed from './Embed'

export const userWarnAdd = async (
  client: BotClient,
  userId: string,
  guildId: string,
  reason: string,
  managerId: string,
  interaction?: CommandInteraction
) => {
  const insertRes = await Warning.insertMany({
    userId: userId,
    guildId: guildId,
    reason: reason,
    managerId: managerId
  })
  const embedAdd = new Embed(client, 'error')
    .setTitle('경고 추가')
    .setDescription('아래와 같이 경고가 추가되었습니다')
    .setFields(
      { name: '경고 ID', value: insertRes[0]._id.toString() },
      {
        name: '유저',
        value: `<@${userId}>` + '(' + '`' + userId + '`' + ')',
        inline: true
      },
      { name: '사유', value: reason, inline: true }
    )
  if (interaction) {
    interaction.editReply({ embeds: [embedAdd] })
  }
  const logSetting = await LoggerSetting.findOne({ guild_id: guildId })
  const guildLogChannel: TextChannel = client.guilds.cache
    .get(guildId)
    ?.channels.cache.get(logSetting?.guild_channel_id as string) as TextChannel
  if (!guildLogChannel) return
  guildLogChannel.send({ embeds: [embedAdd] })
  try {
    const guildRoles = client.guilds.cache.get(guildId)?.roles.cache
    const member = client.guilds.cache.get(guildId)?.members.cache.get(userId)
    if (!member) return
    const warns = await Warning.find({ userId: userId, guildId: guildId })
    let role_id: string | undefined = undefined
    let remove_role_id: string | undefined = undefined
    guildRoles?.each((role) => {
      if (role.name == `경고 ${warns.length}회`) return (role_id = role.id)
      if (warns.length == 1) return
      if (role.name == `경고 ${warns.length - 1}회`)
        return (remove_role_id = role.id)
    })
    if (remove_role_id) member.roles.remove(remove_role_id)
    if (role_id) member.roles.add(role_id)
  } catch (e) {
    console.log(e)
  }
}
