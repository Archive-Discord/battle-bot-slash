import { BaseCommand, SlashCommand } from '../../structures/Command'
import UserDB from '../../schemas/userSchema'
import Embed from '../../utils/Embed'
import { SlashCommandBuilder, userMention } from '@discordjs/builders'
import { MessageButton } from 'discord.js'
import paginationEmbed from "../../utils/button-pagination"

export default new BaseCommand(
  {
    name: 'queue',
    description: '노래의 재생목록을 확인합니다',
    aliases: ['재생목록', 'musicqueue', '큐']
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

      const buttons = [
        new MessageButton()
            .setCustomId('previousbtn')
            .setLabel('이전')
            .setStyle('SECONDARY'),
        new MessageButton()
            .setCustomId('nextbtn')
            .setLabel('다음')
            .setStyle('SUCCESS')
    ];
    const pages = [];
    let page = 1;
    let emptypage;
    do {
      const pageStart = 10 * (page - 1);
      const pageEnd = pageStart + 10;
      const tracks = queue.tracks.slice(pageStart, pageEnd).map((m, i) => {
          return `**${i + pageStart + 1}**. [${m.title}](${m.url}) ${m.duration} - ${m.requestedBy}`;
      });
      if(tracks.length) {
          sucessembed.setDescription(`\n${tracks.join('\n')}${
              queue.tracks.length > pageEnd
                  ? `\n... + ${queue.tracks.length - pageEnd}`
                  : ''
          }`);
          sucessembed.setAuthor(`재생 중인 노래 🎵 ${queue.current.title} - ${queue.current.author}`, undefined, `${queue.current.url}`);
          pages.push(sucessembed);
          page++;
      }
      else  {
          emptypage = 1;
          if(page === 1) {
              sucessembed.setDescription(`더 이상 재생목록에 노래가 없습니다.`);
              sucessembed.setAuthor(`재생 중인 노래 🎵 ${queue.current.title} - ${queue.current.author}`,undefined, `${queue.current.url}`);
              return interaction.editReply({ embeds: [sucessembed] });
          }
          if(page === 2) {
              return interaction.editReply({ embeds: [pages[0]] });
          }
      }
  } while(!emptypage);
    return paginationEmbed(interaction, pages, buttons, 30000);
    }
  }
)

