const { Guild } = require('discord.js') // eslint-disable-line no-unused-vars
const Embed = require('../utils/Embed')
const CommandManager = require('../managers/CommandManager')
const ErrorManager = require('../managers/ErrorManager')

module.exports = {
  name: 'guildCreate',
  /**
   * 
   * @param {import('../structures/BotClient')} client 
   * @param {Guild} guild 
   */
  async execute(client, guild) {
    let commandManager = new CommandManager(client)
    let errorManager = new ErrorManager(client)
    let owner = await guild.fetchOwner()
    let embed = new Embed(client, 'success')
    .setTitle(`${guild.name}서버에 배틀이를 초대해주셔서 감사합니다`)
    .setDescription(`- [웹 대시보드](https://battlebot.kr/) 에서 서버를 관리 하실수 있습니다 \n - 명령어는 \`ㅂ도움말\` 을 사용하여 확인 할 수 있습니다`)
    owner.send({embeds: [embed]})
    commandManager.slashCommandSetup(guild.id).then((data) => {
        owner.send({
          embeds: [
            new Embed(client, 'success')
              .setTitle('로딩완료!')
              .setDescription(`${data.length}개의 (/) 명령어를 생성했어요!`),
          ],
        })
      }).catch((error) => {
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
          errorManager.report(error, message, true)
        }
      })
  }
}
