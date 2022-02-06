import Discord from 'discord.js'
import CommandManager from 'src/managers/CommandManager'
import Embed from 'src/utils/Embed'
import Logger from 'src/utils/Logger'
import { Event } from '../structures/Event'
const log = new Logger('GuildCreateEvent')
export default new Event('guildCreate', async (client, guild) => {
  const commandManager = new CommandManager(client)
  const owner = await guild.fetchOwner()
  const embed = new Embed(client, 'success')
    .setTitle(`${guild.name}서버에 배틀이를 초대해주셔서 감사합니다`)
    .setDescription('- [웹 대시보드](https://battlebot.kr/) 에서 서버를 관리 하실수 있습니다 \n - 명령어는 `ㅂ도움말` 을 사용하여 확인 할 수 있습니다')
  owner.send({embeds: [embed]})
  commandManager.slashCommandSetup(guild.id).catch((error) => {
    if(error.code === Discord.Constants.APIErrors.MISSING_ACCESS) {
      owner.send({
        embeds: [
          new Embed(client, 'error')
            .setTitle('Error!')
            .setDescription(
              '제 봇 권한이 부족합니다...\n> 필요한 권한\n`applications.commands`스코프'
            ),
        ],
      })
    } else {
      log.error(error)
    }
  })
})
