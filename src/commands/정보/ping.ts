import { BaseCommand } from '../../structures/Command'
import Discord from 'discord.js'
import Embed from '../../utils/Embed'
import { SlashCommandBuilder } from '@discordjs/builders'

export default new BaseCommand(
  {
    name: 'ping',
    description: '핑을 측정합니다.',
    aliases: ['핑', '측정', 'vld']
  },
  async (client, message, args) => {
    let embed = new Embed(client, 'warn')
      .setTitle('핑 측정중...')
      .setColor('#2f3136')

    let m = await message.reply({
      embeds: [embed]
    })
    embed = new Embed(client, 'success')
      .setColor('#2f3136')
      .setTitle('PONG!')
      .addFields(
        '메세지 응답속도',
        `${Number(m.createdAt) - Number(message.createdAt)}ms`,
        true
      )
      .addFields('API 반응속도', `${client.ws.ping}ms`, true)
      .addFields('업타임', `<t:${(Number(client.readyAt) / 1000) | 0}:R>`, true)

    m.edit({
      embeds: [embed]
    })
  },
  {
    data: new SlashCommandBuilder()
      .setName('핑')
      .setDescription('핑을 측정합니다.'),
    options: {
      name: '핑',
      isSlash: true
    },
    async execute(client, interaction) {
      let PingEmbed = new Embed(client, 'success')
        .setColor('#2f3136')
        .setTitle('핑 측정')
        .addFields('웹소켓 지연속도', `${client.ws.ping}ms`)
        .addFields('업타임', `<t:${(Number(client.readyAt) / 1000) | 0}:R>`)
      interaction.reply({ embeds: [PingEmbed], ephemeral: true })
    }
  }
)
