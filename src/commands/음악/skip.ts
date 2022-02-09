import { BaseCommand, SlashCommand } from '../../structures/Command'
import UserDB from '../../schemas/userSchema'
import Embed from '../../utils/Embed'
import { SlashCommandBuilder, userMention } from '@discordjs/builders'
import DateFormatting from '../../utils/DateFormatting'

export default new BaseCommand(
  {
    name: 'skip',
    description: '노래를 스킵합니다',
    aliases: ['스킵', 'musicskip']
  },
  async (client, message, args) => {
    let errembed = new Embed(client, 'error')
      .setTitle('어라...')
    let sucessembed = new Embed(client, 'success')
    if(!message.guild) {
      errembed.setDescription('이 명령어는 서버에서만 사용이 가능해요!')
      return message.reply({embeds: [errembed]})
    }
    const user = message.guild?.members.cache.get(message.author.id);
    const queue = client.player.getQueue(message.guild.id);
    if (!queue || !queue.playing) {
      errembed.setDescription('노래가 재생 중이지 않아요!')
      return message.reply({embeds: [errembed]});
    }
    const memberChannel = user?.voice.channelId
    if(!memberChannel) {
      errembed.setDescription('먼저 음성 채널에 입장해 주세요')
      return message.reply({embeds: [errembed]});
    }
    if(message.guild.me?.voice.channelId !== memberChannel) {
      errembed.setDescription('다른 채널에서 노래가 재생 중이에요')
      return message.reply({embeds: [errembed]});
    }

    if (queue.tracks.length < 1) {
      errembed.setDescription('스킵할 노래가 없어요!')
      return message.reply({embeds: [errembed]});
    }

    if(args[0]) {
      if(typeof args[0] !== "number") {
        errembed.setDescription('숫자만 입력해주세요')
        return message.reply({embeds: [errembed]});
      }
      let index = args[0] as number
      index = index - 1;
      if (queue.tracks.length < 1) {
        errembed.setDescription('넘길 수 있는 노래가 없어요')
        return message.reply({embeds: [errembed]});
      }      
      if (index > queue.tracks.length || index < 0 || !queue.tracks[index]) {
        errembed.setDescription(`${args[0]}곡 만큼 노래를 넘길 수 없어요`)
        return message.reply({embeds: [errembed]});
      }
      queue.jump(index)
      sucessembed.setDescription(`${userMention(message.author.id)}님의 요청으로 ${args[0]}곡을 스킵했어요!`)
      return message.reply({embeds: [sucessembed]});
    }

    queue.skip();
    sucessembed.setDescription(`${userMention(message.author.id)}님의 요청으로 ${queue.nowPlaying().title} 노래를 스킵했어요!`)
    return message.reply({embeds: [sucessembed]});
  },
  {
    data: new SlashCommandBuilder()
    .setName('스킵')
    .addNumberOption(option =>
      option
        .setName("count")
        .setDescription("스킵할 노래의 수를 적어주세요")
        .setRequired(false)
    )
    .setDescription('노래를 스킵합니다'),
    options: {
      name: '스킵',
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
      const user = interaction.guild?.members.cache.get(interaction.user.id);
      const queue = client.player.getQueue(interaction.guild.id);
      if (!queue || !queue.playing) {
        errembed.setDescription('노래가 재생 중이지 않아요!')
        return interaction.editReply({embeds: [errembed]});
      }
      const memberChannel = user?.voice.channelId
      if(!memberChannel) {
        errembed.setDescription('먼저 음성 채널에 입장해 주세요')
        return interaction.editReply({embeds: [errembed]});
      }
      if(interaction.guild.me?.voice.channelId !== memberChannel) {
        errembed.setDescription('다른 채널에서 노래가 재생 중이에요')
        return interaction.editReply({embeds: [errembed]});
      }

      if (queue.tracks.length < 1 && queue.repeatMode !== 3) {
        errembed.setDescription('스킵할 노래가 없어요!')
        return interaction.editReply({embeds: [errembed]});
      }
      let count = interaction.options.getNumber("count", true);
      if(count) {
        let index = count
        index = index - 1;
        if (queue.tracks.length < 1) {
          errembed.setDescription('넘길 수 있는 노래가 없어요')
          return interaction.editReply({embeds: [errembed]});
        }      
        if (index > queue.tracks.length || index < 0 || !queue.tracks[index]) {
          errembed.setDescription(`${count}곡 만큼 노래를 넘길 수 없어요`)
          return interaction.editReply({embeds: [errembed]});
        }
        queue.jump(index)
        sucessembed.setDescription(`${userMention(interaction.user.id)}님의 요청으로 ${count}곡을 스킵했어요!`)
        return interaction.editReply({embeds: [sucessembed]});
      }
      queue.skip();
      sucessembed.setDescription(`${userMention(interaction.user.id)}님의 요청으로 ${queue.nowPlaying().title} 노래를 스킵했어요!`)
      return interaction.editReply({embeds: [sucessembed]});
    }
  }
)

