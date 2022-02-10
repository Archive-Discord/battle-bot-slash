import { BaseCommand, SlashCommand } from '../../structures/Command'
import UserDB from '../../schemas/userSchema'
import Embed from '../../utils/Embed'
import { SlashCommandBuilder, userMention } from '@discordjs/builders'
import DateFormatting from '../../utils/DateFormatting'

export default new BaseCommand(
  {
    name: 'pause',
    description: '노래를 일시정지합니다',
    aliases: ['일시정지', 'musicpause']
  },
  async (client, message, args) => {
    let errembed = new Embed(client, 'error')
    let sucessembed = new Embed(client, 'success')
    if(!message.guild) {
      errembed.setTitle('이 명령어는 서버에서만 사용이 가능해요!')
      return message.reply({embeds: [errembed]})
    }
    const user = message.guild?.members.cache.get(message.author.id);
    const queue = client.player.getQueue(message.guild.id);
    if (!queue || !queue.playing) {
      errembed.setTitle('노래가 재생 중이지 않아요!')
      return message.reply({embeds: [errembed]});
    }
    const memberChannel = user?.voice.channelId
    if(!memberChannel) {
      errembed.setTitle('먼저 음성 채널에 입장해 주세요')
      return message.reply({embeds: [errembed]});
    }
    if(message.guild.me?.voice.channelId !== memberChannel) {
      errembed.setTitle('다른 채널에서 노래가 재생 중이에요')
      return message.reply({embeds: [errembed]});
    }

    if (queue.connection.paused) {
      queue.setPaused(false);
      sucessembed.setTitle('일시정지를 해제했어요!')
      return message.reply({embeds: [sucessembed]});
    } else {
      queue.setPaused(true);
      sucessembed.setTitle('노래를 일시정지 했어요!')
      return message.reply({embeds: [sucessembed]});
    }
  },
  {
    data: new SlashCommandBuilder()
    .setName('일시정지')
    .setDescription('노래를 일시정지합니다'),
    options: {
      name: '일시정지',
      isSlash: true
    },
    async execute(client, interaction) {
      await interaction.deferReply()
      let errembed = new Embed(client, 'error')
      let sucessembed = new Embed(client, 'success')
      if(!interaction.guild) {
        errembed.setTitle('이 명령어는 서버에서만 사용이 가능해요!')
        return interaction.editReply({embeds: [errembed]})
      }
      const user = interaction.guild?.members.cache.get(interaction.user.id);
      const queue = client.player.getQueue(interaction.guild.id);
      if (!queue || !queue.playing) {
        errembed.setTitle('노래가 재생 중이지 않아요!')
        return interaction.editReply({embeds: [errembed]});
      }
      const memberChannel = user?.voice.channelId
      if(!memberChannel) {
        errembed.setTitle('먼저 음성 채널에 입장해 주세요')
        return interaction.editReply({embeds: [errembed]});
      }
      if(interaction.guild.me?.voice.channelId !== memberChannel) {
        errembed.setTitle('다른 채널에서 노래가 재생 중이에요')
        return interaction.editReply({embeds: [errembed]});
      }

      if (queue.connection.paused) {
        queue.setPaused(false);
        sucessembed.setTitle('일시정지를 해제했어요!')
        return interaction.editReply({embeds: [sucessembed]});
      } else {
        queue.setPaused(true);
        sucessembed.setTitle('노래를 일시정지 했어요!')
        return interaction.editReply({embeds: [sucessembed]});
      }
    }
  }
)

