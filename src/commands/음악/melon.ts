import { BaseCommand, SlashCommand } from '../../structures/Command'
import UserDB from '../../schemas/userSchema'
import Embed from '../../utils/Embed'
import { SlashCommandBuilder, userMention } from '@discordjs/builders'
import paginationEmbed from '../../utils/button-pagination'
import request from "request"
import { PlayerSearchResult, Queue } from 'discord-player'
import cheerio from 'cheerio'
import axios from 'axios'

export default new BaseCommand(
  {
    name: 'melonchart',
    description: '멜론차트를 재생 합니다',
    aliases: ['멜론차트재생', 'melonchartplay','pmelon']
  },
  async (client, message, args) => {
      let errembed = new Embed(client, 'error')
      let sucessembed = new Embed(client, 'success')
      if(!message.guild) {
        errembed.setTitle('❌ 이 명령어는 서버에서만 사용이 가능해요!')
        return message.reply({embeds: [errembed]})
      }
      const user = message.guild?.members.cache.get(message.author.id);
      const channel = user?.voice.channel;
      if(!channel) {
        errembed.setTitle('❌ 음성 채널에 먼저 입장해주세요!')
        return message.reply({embeds: [errembed]})
      }
      const guildQueue = client.player.getQueue(message.guild.id)
      if(guildQueue){
        if(channel.id !== message.guild.me?.voice.channelId) {
          errembed.setTitle('❌ 이미 다른 음성 채널에서 재생 중입니다!')
          return message.reply({embeds: [errembed]})
        }
      } else {
        if(!channel.viewable) {
          errembed.setTitle('\`채널보기\` 권한이 필요해요!')
          return message.reply({embeds: [errembed]})
        }
        if(!channel.joinable) {
          errembed.setTitle('\`채널입장\` 권한이 필요해요!')
          return message.reply({embeds: [errembed]})
        }
        if(channel.full) {
          errembed.setTitle('채널이 가득 차 입장할 수 없어요!')
          return message.reply({embeds: [errembed]})
        }
      }
      sucessembed.setDescription('멜론차트를 불러오는 중이에요!')
      let msg = await message.reply({embeds: [sucessembed]})
      let chart = await getData()
      let notFound: string[] = []
      let found: string[] = []
      chart.data.forEach(async(x) => {
        let result = await client.player.search(`${x.name} - ${x.artist} +가사` , {requestedBy: message.author}).catch((e) =>{}) as PlayerSearchResult
        if(!result) return notFound.push(`${x.name} - ${x.artist}`)
        found.push(`${x.name} - ${x.artist}`)
        await queue.addTrack(result.tracks[0])
      })
      let queue: Queue;
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
        errembed.setTitle(`❌ 음성 채널에 입장할 수 없어요 ${e}`)
        return message.reply({embeds: [errembed]})
      }
      if(!queue.playing) await queue.play();
      sucessembed.setTitle(`아래 노래들을 추가했어요!`)
      sucessembed.setDescription(`${found.join('\n')}`)
      return msg.edit({embeds: [sucessembed]})
  },
  {
    data: new SlashCommandBuilder()
    .setName('멜론차트재생')
    .setDescription('멜론차트 TOP10 을 재생합니다'),
    options: {
      name: '멜론차트재생',
      isSlash: true
    },
    async execute(client, interaction) {
      await interaction.deferReply()
      let errembed = new Embed(client, 'error')
      let sucessembed = new Embed(client, 'success')
      if(!interaction.guild) {
        errembed.setTitle('❌ 이 명령어는 서버에서만 사용이 가능해요!')
        return interaction.editReply({embeds: [errembed]})
      }
      const user = interaction.guild?.members.cache.get(interaction.user.id);
      const channel = user?.voice.channel;
      if(!channel) {
        errembed.setTitle('❌ 음성 채널에 먼저 입장해주세요!')
        return interaction.editReply({embeds: [errembed]})
      }
      const guildQueue = client.player.getQueue(interaction.guild.id)
      if(guildQueue){
        if(channel.id !== interaction.guild.me?.voice.channelId) {
          errembed.setTitle('❌ 이미 다른 음성 채널에서 재생 중입니다!')
          return interaction.editReply({embeds: [errembed]})
        }
      } else {
        if(!channel.viewable) {
          errembed.setTitle('\`채널보기\` 권한이 필요해요!')
          return interaction.editReply({embeds: [errembed]})
        }
        if(!channel.joinable) {
          errembed.setTitle('\`채널입장\` 권한이 필요해요!')
          return interaction.editReply({embeds: [errembed]})
        }
        if(channel.full) {
          errembed.setTitle('채널이 가득 차 입장할 수 없어요!')
          return interaction.editReply({embeds: [errembed]})
        }
      }
      sucessembed.setDescription('멜론차트를 불러오는 중이에요!')
      await interaction.editReply({embeds: [sucessembed]})
      let chart = await getData()
      let notFound: string[] = []
      let found: string[] = []
      chart.data.forEach(async(x) => {
        let result = await client.player.search(`${x.name} - ${x.artist} +가사` , {requestedBy: interaction.user}).catch((e) =>{}) as PlayerSearchResult
        if(!result) return notFound.push(`${x.name} - ${x.artist}`)
        found.push(`${x.name} - ${x.artist}`)
        await queue.addTrack(result.tracks[0])
      })
      let queue: Queue;
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
        errembed.setTitle(`❌ 음성 채널에 입장할 수 없어요 ${e}`)
        return interaction.editReply({embeds: [errembed]})
      }
      if(!queue.playing) await queue.play();
      sucessembed.setTitle(`아래 노래들을 추가했어요!`)
      sucessembed.setDescription(`${found.join('\n')}`)
      return interaction.editReply({embeds: [sucessembed]})
    }
  }
)

const getData = async() => {
  return axios.get('https://www.melon.com/chart/index.htm')
    .then(html => {
      let ulList: music[] = []
      const $ = cheerio.load(html.data)
      const $bodyList = $('div.service_list_song table tbody').children('tr')
      $bodyList.each((i, elem) => {
        ulList[i] = {
          rank: Number($(elem).find('td div span.rank').text()),
          albumImg: $(elem).find('td div a img').attr('src') as string,
          name: $(elem).find('td div div div.rank01 span a').text(),
          artist: $(elem).find('td div div div.rank02 a').first().text()
        }
      })
      const data = ulList.filter(n => n.rank);
      return data.slice(0, 10);
    })
    .then(res => {
      return Promise.resolve({
        data: res
      })
    })
    .catch(err => {
      return Promise.reject({
        data: err
      })
    })
}

interface music {
  rank: number
  albumImg: string,
  name: string,
  artist: string
}