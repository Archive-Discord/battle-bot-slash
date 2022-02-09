import { BaseCommand, SlashCommand } from '../../structures/Command'
import UserDB from '../../schemas/userSchema'
import Embed from '../../utils/Embed'
import { SlashCommandBuilder, userMention } from '@discordjs/builders'
import DateFormatting from '../../utils/DateFormatting'

export default new BaseCommand(
  {
    name: 'playing',
    description: '현재 재생중인 노래를 확인합니다',
    aliases: ['현재재생중', 'musicnow']
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

    sucessembed.setTitle('재생 중인 노래 🎵')
    sucessembed.setDescription(`${queue.nowPlaying().title}`)
    sucessembed.setThumbnail(queue.nowPlaying().thumbnail)
    sucessembed.addField('요청유저', userMention(queue.nowPlaying().requestedBy.id))
    return message.reply({embeds: [sucessembed]});
  },
  {
    data: new SlashCommandBuilder()
    .setName('현재재생중')
    .setDescription('현재 재생중인 노래를 확인합니다'),
    options: {
      name: '현재재생중',
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
      sucessembed.setTitle('재생 중인 노래 🎵')
      sucessembed.setDescription(`${queue.nowPlaying().title}`)
      sucessembed.setThumbnail(queue.nowPlaying().thumbnail)
      sucessembed.addField('길이', queue.nowPlaying().duration, true)
      sucessembed.addField('요청유저', userMention(queue.nowPlaying().requestedBy.id), true)
      return interaction.editReply({embeds: [sucessembed]});
    }
  }
)

