import { BaseCommand, SlashCommand } from '../../structures/Command'
import UserDB from '../../schemas/userSchema'
import Embed from '../../utils/Embed'
import { SlashCommandBuilder, userMention } from '@discordjs/builders'
import DateFormatting from '../../utils/DateFormatting'

export default new BaseCommand(
  {
    name: 'play',
    description: '노래를 재생합니다',
    aliases: ['재생', 'musicplay', 'wotod']
  },
  async (client, message, args) => {
      let errembed = new Embed(client, 'error')
        .setTitle('어라...')
      let sucessembed = new Embed(client, 'success')
      if(!message.guild) {
        errembed.setDescription('이 명령어는 서버에서만 사용이 가능해요!')
        return message.reply({embeds: [errembed]})
      }
      if(!args[0]) {
        errembed.setDescription('노래 제목을 적어주세요')
        return message.reply({embeds: [errembed]})
      }
      const song = args[0]
      const user = message.guild?.members.cache.get(message.author.id);
      const channel = user?.voice.channel;
      if(!channel) {
        errembed.setDescription('음성 채널에 먼저 입장해주세요!')
        return message.reply({embeds: [errembed]})
      }
      const guildQueue = client.player.getQueue(message.guild.id)
      if(guildQueue){
        if(channel.id !== message.guild.me?.voice.channelId) {
          errembed.setDescription('이미 다른 음성 채널에서 재생 중입니다!')
          return message.reply({embeds: [errembed]})
        }
      } else {
        if(!channel.viewable) {
          errembed.setDescription('\`채널보기\` 권한이 필요해요!')
          return message.reply({embeds: [errembed]})
        }
        if(!channel.joinable) {
          errembed.setDescription('\`채널입장\` 권한이 필요해요!')
          return message.reply({embeds: [errembed]})
        }
        if(channel.full) {
          errembed.setDescription('채널이 가득 차 입장할 수 없어요!')
          return message.reply({embeds: [errembed]})
        }
      }
      let result = await client.player.search(song, {requestedBy: message.author}).catch((e) =>{})
      if(!result || !result.tracks.length) {
        errembed.setDescription(`${song}을 찾지 못했어요!`)
        return message.reply({embeds: [errembed]})
      }
      let queue;
      if(guildQueue) {
        queue = guildQueue;
        queue.metadata = message
      } else {
        queue = await client.player.createQueue(message.guild, {
          metadata: message
        })
      }
      try {
        if(!queue.connection) await queue.connect(channel);
      } catch(e) {
        client.player.deleteQueue(message.guild.id);
        errembed.setDescription(`음성 채널에 입장할 수 없어요 ${e}`)
        return message.reply({embeds: [errembed]})
      }
      result.playlist ? queue.addTracks(result.tracks) : queue.addTrack(result.tracks[0]);
      if(result.playlist) {
        let songs: String[] = []
        result.playlist.tracks.forEach((music) => {
          songs.push(music.title)
        })
        sucessembed.setTitle('재생목록에 아래 노래들을 추가했어요!')
        sucessembed.setDescription(songs.join(', '))
        sucessembed.setThumbnail(result.playlist.thumbnail)
        sucessembed.addField('요청유저', userMention(result.tracks[0].requestedBy.id), true)
        sucessembed.addField('재생목록 제작자', result.playlist.author.name, true)
      } else {
        sucessembed.setDescription('재생목록에 노래를 추가했어요!')
        sucessembed.setTitle(result.tracks[0].title)
        sucessembed.setThumbnail(result.tracks[0].thumbnail)
        sucessembed.setURL(result.tracks[0].url)
        sucessembed.addField('길이', result.tracks[0].duration, true)
        sucessembed.addField('요청유저', userMention(result.tracks[0].requestedBy.id), true)
      }
      if(queue.playing) {
        message.reply({embeds: [sucessembed]})
      } else {
        message.reply({embeds: [sucessembed]})
        await queue.play();
      }
  },
  {
    data: new SlashCommandBuilder()
    .setName('재생')
    .addStringOption(option =>
      option
        .setName("song")
        .setDescription("재생할 노래 재목 또는 링크를 적어주세요")
        .setRequired(true)
    )
    .setDescription('노래를 재생합니다'),
    options: {
      name: '재생',
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
      const song = interaction.options.getString("song", true);
      const user = interaction.guild?.members.cache.get(interaction.user.id);
      const channel = user?.voice.channel;
      if(!channel) {
        errembed.setDescription('음성 채널에 먼저 입장해주세요!')
        return interaction.editReply({embeds: [errembed]})
      }
      const guildQueue = client.player.getQueue(interaction.guild.id)
      if(guildQueue){
        if(channel.id !== interaction.guild.me?.voice.channelId) {
          errembed.setDescription('이미 다른 음성 채널에서 재생 중입니다!')
          return interaction.editReply({embeds: [errembed]})
        }
      } else {
        if(!channel.viewable) {
          errembed.setDescription('\`채널보기\` 권한이 필요해요!')
          return interaction.editReply({embeds: [errembed]})
        }
        if(!channel.joinable) {
          errembed.setDescription('\`채널입장\` 권한이 필요해요!')
          return interaction.editReply({embeds: [errembed]})
        }
        if(channel.full) {
          errembed.setDescription('채널이 가득 차 입장할 수 없어요!')
          return interaction.editReply({embeds: [errembed]})
        }
      }
      let result = await client.player.search(song, {requestedBy: interaction.user}).catch((e) =>{})
      if(!result || !result.tracks.length) {
        errembed.setDescription(`${song}을 찾지 못했어요!`)
        return interaction.editReply({embeds: [errembed]})
      }
      let queue;
      if(guildQueue) {
        queue = guildQueue;
        queue.metadata = interaction
      } else {
        queue = await client.player.createQueue(interaction.guild, {
          metadata: interaction
        })
      }
      try {
        if(!queue.connection) await queue.connect(channel);
      } catch(e) {
        client.player.deleteQueue(interaction.guild.id);
        errembed.setDescription(`음성 채널에 입장할 수 없어요 ${e}`)
        return interaction.editReply({embeds: [errembed]})
      }
      result.playlist ? queue.addTracks(result.tracks) : queue.addTrack(result.tracks[0]);
      if(result.playlist) {
        let songs: String[] = []
        result.playlist.tracks.forEach((music) => {
          songs.push(music.title)
        })
        sucessembed.setTitle('재생목록에 아래 노래들을 추가했어요!')
        sucessembed.setDescription(songs.join(', '))
        sucessembed.setThumbnail(result.playlist.thumbnail)
        sucessembed.addField('요청유저', userMention(result.tracks[0].requestedBy.id), true)
        sucessembed.addField('재생목록 제작자', result.playlist.author.name, true)
      } else {
        sucessembed.setDescription('재생목록에 노래를 추가했어요!')
        sucessembed.setTitle(result.tracks[0].title)
        sucessembed.setThumbnail(result.tracks[0].thumbnail)
        sucessembed.setURL(result.tracks[0].url)
        sucessembed.addField('길이', result.tracks[0].duration, true)
        sucessembed.addField('요청유저', userMention(result.tracks[0].requestedBy.id), true)
      }
      if(queue.playing) {
        interaction.editReply({embeds: [sucessembed]})
      } else {
        interaction.editReply({embeds: [sucessembed]})
        await queue.play();
      }
    }
  }
)

