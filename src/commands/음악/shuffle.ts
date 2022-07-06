import { BaseCommand, SlashCommand } from '../../structures/Command'
import UserDB from '../../schemas/userSchema'
import Embed from '../../utils/Embed'
import { SlashCommandBuilder, userMention } from '@discordjs/builders'
import DateFormatting from '../../utils/DateFormatting'

export default new BaseCommand(
  {
    name: 'shuffle',
    description: '노래를 섞습니다',
    aliases: ['셔플', 'musicshuffle']
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
    const user = message.guild?.members.cache.get(message.author.id);
    const queue = client.player.getQueue(message.guild.id);
    if (!queue || !queue.playing) {
      errembed.setDescription('노래가 재생 중이지 않습니다.')
      return message.reply({embeds: [errembed]});
    }
    const memberChannel = user?.voice.channelId
    if(!memberChannel) {
      errembed.setDescription('먼저 음성 채널에 입장해 주세요.')
      return message.reply({embeds: [errembed]});
    }
    if(message.guild.me?.voice.channelId !== memberChannel) {
      errembed.setDescription('다른 채널에서 노래가 재생 중입니다.')
      return message.reply({embeds: [errembed]});
    }

    queue.shuffle()
    sucessembed.setDescription(`${userMention(message.author.id)}님의 요청으로 대기열을 섞었어요!`)
    return message.reply({embeds: [sucessembed]});
  },
  {
    data: new SlashCommandBuilder()
    .setName('셔플')
    .setDescription('노래를 섞습니다'),
    options: {
      name: '셔플',
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
        errembed.setDescription('이 명령어는 서버에서만 사용 가능합니다.')
        return interaction.editReply({embeds: [errembed]})
      }
      const user = interaction.guild?.members.cache.get(interaction.user.id);
      const queue = client.player.getQueue(interaction.guild.id);
      if (!queue || !queue.playing) {
        errembed.setDescription('노래가 재생 중이지 않습니다.')
        return interaction.editReply({embeds: [errembed]});
      }
      const memberChannel = user?.voice.channelId
      if(!memberChannel) {
        errembed.setDescription('먼저 음성 채널에 입장해 주세요.')
        return interaction.editReply({embeds: [errembed]});
      }
      if(interaction.guild.me?.voice.channelId !== memberChannel) {
        errembed.setDescription('다른 채널에서 노래가 재생 중입니다.')
        return interaction.editReply({embeds: [errembed]});
      }

      queue.shuffle()
      sucessembed.setDescription(`${userMention(interaction.user.id)}님의 요청으로 대기열을 섞었습니다.`)
      return interaction.editReply({embeds: [sucessembed]});
    }
  }
)

