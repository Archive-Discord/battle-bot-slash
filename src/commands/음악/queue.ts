import { BaseCommand, SlashCommand } from '../../structures/Command'
import UserDB from '../../schemas/userSchema'
import Embed from '../../utils/Embed'
import { SlashCommandBuilder, userMention } from '@discordjs/builders'
import DateFormatting from '../../utils/DateFormatting'

export default new BaseCommand(
  {
    name: 'queue',
    description: '노래의 재생목록을 확인합니다',
    aliases: ['재생목록', 'musicqueue', '큐']
  },
  async (client, message, args) => {
    let errembed = new Embed(client, 'error')
      .setTitle('어라...')
    let sucessembed = new Embed(client, 'success')
    if(!message.guild) {
      errembed.setDescription('이 명령어는 서버에서만 사용이 가능해요!')
      return message.reply({embeds: [errembed]})
    }
    const queue = client.player.getQueue(message.guild.id);
    if (!queue || !queue.playing) {
      errembed.setDescription('노래가 재생 중이지 않아요!')
      return message.reply({embeds: [errembed]});
    }
    let queues = new Array()
    let more = 0
    queue.tracks.forEach((track, index) => {
      if(index < 50) {
        queues.push(`${index + 1}. ${track.title} - ${track.author} - ${track.duration} ${userMention(track.requestedBy.id)}`)
      } else {
        more++
      }
    })
    if(more > 1) {
      queues.push(`+ ${more}곡`)
    }
    sucessembed.setTitle('재생목록')
    sucessembed.setDescription(queues.join("\n"))
    return message.reply({embeds: [sucessembed]});
  },
  {
    data: new SlashCommandBuilder()
    .setName('재생목록')
    .setDescription('노래의 재생목록을 확인합니다'),
    options: {
      name: '재생목록',
      isSlash: true
    },
    async execute(client, interaction) {
      await interaction.deferReply()
      let errembed = new Embed(client, 'error')
        .setTitle('어라...')
      let sucessembed = new Embed(client, 'success')
      if(!interaction.guild) {
        errembed.setDescription('이 명령어는 서버에서만 사용이 가능해요!')
        return interaction.editReply({embeds: [errembed]})
      }
      const queue = client.player.getQueue(interaction.guild.id);
      if (!queue || !queue.playing) {
        errembed.setDescription('노래가 재생 중이지 않아요!')
        return interaction.editReply({embeds: [errembed]});
      }

      let queues = new Array()
      let more = 0
      queue.tracks.forEach((track, index) => {
        if(index < 50) {
          queues.push(`${index + 1}. ${track.title} - ${track.author} - ${track.duration} ${userMention(track.requestedBy.id)}`)
        } else {
          more++
        }
      })
      if(more > 1) {
        queues.push(`+ ${more}곡`)
      }
      sucessembed.setTitle('재생목록')
      sucessembed.setDescription(queues.join("\n"))
      return interaction.editReply({embeds: [sucessembed]});
    }
  }
)

