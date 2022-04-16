import Discord, { TextChannel } from 'discord.js'
import CommandManager from '../managers/CommandManager'
import Embed from '../utils/Embed'
import Logger from '../utils/Logger'
import { Event } from '../structures/Event'
import config from '../../config'
const log = new Logger('GuildCreateEvent')

export default new Event('guildCreate', async (client, guild) => {
  const owner = await guild.fetchOwner()
  const embed = new Embed(client, 'success')
    .setTitle(`${guild.name}서버에 배틀이를 초대해주셔서 감사합니다`)
    .setDescription(
      `- [웹 대시보드](https://battlebot.kr/) 에서 서버를 관리 하실수 있습니다 \n - 명령어는 \`!도움말\` 을 사용하여 확인 할 수 있습니다 \n - 봇 서포트는 [여기](https://discord.gg/WtGq7D7BZm)에서 받아보실 수 있습니다`
    )
  owner.send({ embeds: [embed] })
  const supprotguild = client.guilds.cache.get(config.guildAddAlert.guildID)
  if (!supprotguild) return
  const supportAlertChannel = supprotguild.channels.cache.get(
    config.guildAddAlert.channelID
  ) as TextChannel
  if (!supportAlertChannel) return
  const res = await client.shard?.fetchClientValues('guilds.cache.size')
  return supportAlertChannel.send(
    `새로운 서버에 추가되었습니다. **(현재 서버수 : ${res?.reduce(
      (acc, guilds) => Number(acc) + Number(guilds),
      0
    )})**`
  )
})
