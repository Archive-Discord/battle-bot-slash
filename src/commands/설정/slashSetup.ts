import Discord from 'discord.js'
import CommandManager from '../../managers/CommandManager'
import Embed from '../../utils/Embed'
import ErrorManager from '../../managers/ErrorManager'
import { BaseCommand } from '../../structures/Command'

export default new BaseCommand(
  {
    name: 'slashSetup',
    aliases: ['slash', 'setup', 'tpxld', '세팅'],
    description: 'Slash Command를 세팅합니다'
  },
  async (client, message, args) => {
    let commandManager = new CommandManager(client)
    let errorManager = new ErrorManager(client)

    let row = new Discord.MessageActionRow().addComponents(
      new Discord.MessageButton()
        .setCustomId('accept')
        .setLabel('동의합니다.')
        .setStyle('SUCCESS')
        .setEmoji('✅')
    )
    let embed = new Embed(client, 'warn')
      .setTitle('잠시만요!')
      .setDescription(
        `Slash Command를 사용하려면 봇 초대할 떄 \`applications.commands\` 스코프를 사용하지 않았을 경우 해당기능을 이용할 수 없습니다. 만약 \`applications.commands\` 스코프를 안 할 경우 [여기를](https://discord.com/api/oauth2/authorize?client_id=${client.user?.id}&scope=applications.commands) 클릭하여 허용해 주시기 바랍니다.`
      )
      .setColor('#2f3136')

    let m = await message.channel.send({ embeds: [embed], components: [row] })

    const collector = m.createMessageComponentCollector({ time: 5000 })

    collector.on('collect', async (i) => {
      if (i.user.id === message.author.id) {
        let loading = new Embed(client, 'info')
          .setDescription('Slash Command 로딩중...')
          .setAuthor(
            '잠시만 기다려주십시요...',
            'https://cdn.discordapp.com/emojis/667750713698549781.gif?v=1'
          )
          .setColor('#2f3136')
        await i.update({ embeds: [loading], components: [] })

        commandManager
          .slashCommandSetup(message.guild?.id as string)
          .then((data) => {
            m.delete()
            message.channel.send({
              embeds: [
                new Embed(client, 'success')
                  .setTitle('로딩완료!')
                  .setDescription(
                    `${data?.length}개의 (/) 명령어를 생성했어요!`
                  )
                  .setColor('#2f3136')
              ]
            })
          })
          .catch((error) => {
            m.delete()
            if (error.code === Discord.Constants.APIErrors.MISSING_ACCESS) {
              message.channel.send({
                embeds: [
                  new Embed(client, 'error')
                    .setTitle('Error!')
                    .setDescription(
                      '제 봇 권한이 부족합니다...\n> 필요한 권한\n`applications.commands`스코프'
                    )
                    .setColor('#2f3136')
                ]
              })
            } else {
              errorManager.report(error, { executer: message, isSend: true })
            }
          })
      } else {
        i.reply({
          content: `명령어 요청한 **${message.author.username}**만 사용할수 있어요.`,
          ephemeral: true
        })
      }
    })
    collector.on('end', (collected) => {
      if (collected.size == 1) return
      m.edit({
        embeds: [embed],
        components: [
          new Discord.MessageActionRow().addComponents(
            new Discord.MessageButton()
              .setCustomId('accept')
              .setLabel('시간 초과. 다시 시도해주세요...')
              .setStyle('SECONDARY')
              .setEmoji('⛔')
              .setDisabled(true)
          )
        ]
      })
    })
  }
)
