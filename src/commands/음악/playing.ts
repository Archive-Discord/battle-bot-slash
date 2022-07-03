import { BaseCommand, SlashCommand } from '../../structures/Command'
import UserDB from '../../schemas/userSchema'
import Embed from '../../utils/Embed'
import { SlashCommandBuilder, userMention } from '@discordjs/builders'
import DateFormatting from '../../utils/DateFormatting'
import musicbuttonrow from '../../utils/musicbutton'

export default new BaseCommand(
  {
    name: 'playing',
    description: '현재 재생중인 노래를 확인합니다',
    aliases: ['현재재생중', 'musicnow']
  },
  async (client, message, args) => {
    let errembed = new Embed(client, 'error')
      .setTitle(`❌ 에러 발생`)
      .setColor('#2f3136')
    let sucessembed = new Embed(client, 'success')
      .setColor('#2f3136')
    if(!message.guild) {
      errembed.setDescription('이 명령어는 서버에서만 사용이 가능합니다.')
      return message.reply({embeds: [errembed]})
    }
    const queue = client.player.getQueue(message.guild.id);
    if (!queue || !queue.playing) {
      errembed.setDescription('노래가 재생 중이지 않습니다.')
      return message.reply({embeds: [errembed]});
    }

    sucessembed.setAuthor('재생 중인 노래', 'https://cdn.discordapp.com/emojis/667750713698549781.gif?v=1', queue.nowPlaying().url)
    sucessembed.setDescription(`[**${queue.nowPlaying().title} - ${queue.nowPlaying().author}**](${queue.nowPlaying().url}) ${queue.nowPlaying().duration} - ${queue.nowPlaying().requestedBy}`)
    sucessembed.setThumbnail(queue.nowPlaying().thumbnail)
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
      await interaction.deferReply({ ephemeral: true })
      let errembed = new Embed(client, 'error')
        .setTitle(`❌ 에러 발생`)
        .setColor('#2f3136')
      let sucessembed = new Embed(client, 'success')
        .setColor('#2f3136')
      if(!interaction.guild) {
        errembed.setDescription('이 명령어는 서버에서만 사용이 가능합니다.')
        return interaction.editReply({embeds: [errembed]})
      }
      const queue = client.player.getQueue(interaction.guild.id);
      if (!queue || !queue.playing) {
        errembed.setDescription('노래가 재생 중이지 않습니다.')
        return interaction.editReply({embeds: [errembed]});
      }
      sucessembed.setAuthor('재생 중인 노래', 'https://cdn.discordapp.com/emojis/667750713698549781.gif?v=1', queue.nowPlaying().url)
      sucessembed.setDescription(`[**${queue.nowPlaying().title} - ${queue.nowPlaying().author}**](${queue.nowPlaying().url}) ${queue.nowPlaying().duration} - ${queue.nowPlaying().requestedBy}`)
      sucessembed.setThumbnail(queue.nowPlaying().thumbnail)
      return musicbuttonrow(interaction, sucessembed)
    }
  }
)

