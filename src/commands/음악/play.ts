import { BaseCommand, SlashCommand } from '../../structures/Command'
import UserDB from '../../schemas/userSchema'
import Embed from '../../utils/Embed'
import { SlashCommandBuilder, userMention } from '@discordjs/builders'
import paginationEmbed from '../../utils/button-pagination'
import {
  MessageActionRow,
  MessageButton,
  MessageEmbed,
  MessageSelectMenu
} from 'discord.js'
import { PlayerSearchResult, Queue } from 'discord-player'
import { getNumberEmogi } from '../../utils/convert'

export default new BaseCommand(
  {
    name: 'play',
    description: '노래를 재생합니다',
    aliases: ['재생', 'musicplay', 'wotod', 'p']
  },
  async (client, message, args) => {
    let errembed = new Embed(client, 'error')
    let sucessembed = new Embed(client, 'success')
    if (!message.guild) {
      errembed.setTitle('❌ 이 명령어는 서버에서만 사용이 가능해요!')
      return message.reply({ embeds: [errembed] })
    }
    if (!args[0]) {
      errembed.setTitle('❌ 노래 제목을 적어주세요')
      return message.reply({ embeds: [errembed] })
    }
    let song = args.slice(1).join(' ')
    if (args.length === 1) song = args[0]
    const user = message.guild?.members.cache.get(message.author.id)
    const channel = user?.voice.channel
    if (!channel) {
      errembed.setTitle('❌ 음성 채널에 먼저 입장해주세요!')
      return message.reply({ embeds: [errembed] })
    }
    const guildQueue = client.player.getQueue(message.guild.id)
    if (guildQueue && message.guild.me?.voice.channelId) {
      if (channel.id !== message.guild.me?.voice.channelId) {
        errembed.setTitle('❌ 이미 다른 음성 채널에서 재생 중입니다!')
        return message.reply({ embeds: [errembed] })
      }
    } else {
      if (!channel.viewable) {
        errembed.setTitle('`채널보기` 권한이 필요해요!')
        return message.reply({ embeds: [errembed] })
      }
      if (!channel.joinable) {
        errembed.setTitle('`채널입장` 권한이 필요해요!')
        return message.reply({ embeds: [errembed] })
      }
      if (channel.full) {
        errembed.setTitle('채널이 가득 차 입장할 수 없어요!')
        return message.reply({ embeds: [errembed] })
      }
    }
    let result = (await client.player
      .search(song, { requestedBy: message.author })
      .catch((e) => {})) as PlayerSearchResult
    if (!result || !result.tracks.length) {
      errembed.setTitle(`❌ ${song}를 찾지 못했어요!`)
      return message.reply({ embeds: [errembed] })
    }
    let queue: Queue
    if (guildQueue) {
      queue = guildQueue
      queue.metadata = message
    } else {
      queue = await client.player.createQueue(message.guild, {
        metadata: message
      })
    }
    try {
      if (!queue.connection) await queue.connect(channel)
    } catch (e) {
      client.player.deleteQueue(message.guild.id)
      errembed.setTitle(`❌ 음성 채널에 입장할 수 없어요 ${e}`)
      return message.reply({ embeds: [errembed] })
    }
    if (result.playlist) {
      let songs: String[] = []
      result.playlist.tracks.forEach((music) => {
        songs.push(music.title)
      })
      sucessembed.setAuthor(
        '재생목록에 아래 노래들을 추가했어요!',
        undefined,
        result.playlist.url
      )
      sucessembed.setColor('#2f3136')
      sucessembed.setDescription(songs.join(', '))
      sucessembed.setThumbnail(result.playlist.thumbnail)
      queue.addTracks(result.tracks)
      if (!queue.playing) await queue.play()
      return message.reply({ embeds: [sucessembed] })
    } else {
      let row = new MessageActionRow()
      let select = new MessageSelectMenu()
        .setCustomId('music.select')
        .setPlaceholder('재생할 노래를 선택해주세요!')
      let trackslist = 15
      if (result.tracks.length < 15) trackslist = result.tracks.length
      for (let i = 0; i < trackslist; i++) {
        select.addOptions([
          {
            label: `${result.tracks[i].title}`,
            description: `${result.tracks[i].author} - ${result.tracks[i].duration}`,
            value: `${i}`,
            emoji: getNumberEmogi(i + 1)
          }
        ])
      }
      row.addComponents(select)
      let msg = await message.reply({
        content: `<:playing:941212508784586772> **${userMention(
          message.author.id
        )} 노래를 선택해주세요!**`,
        components: [row]
      })
      const collector = msg.createMessageComponentCollector({ time: 60000 })
      collector?.on('collect', async (i) => {
        if (i.user.id === message.author.id) {
          if (i.customId === 'music.select') {
            // @ts-ignore
            let index = Number(i.values[0])
            queue.addTrack(result.tracks[index])
            sucessembed.setAuthor(
              `재생목록에 노래를 추가했어요!`,
              undefined,
              result.tracks[index].url
            )
            sucessembed.setDescription(
              `[${result.tracks[index].title}](${result.tracks[index].url}) ${result.tracks[index].duration} - ${result.tracks[index].requestedBy}`
            )
            sucessembed.setThumbnail(result.tracks[index].thumbnail)
            sucessembed.setColor('#2f3136')
            msg.edit({ content: ' ', embeds: [sucessembed], components: [] })
            if (!queue.playing) return await queue.play()
          }
        }
      })
    }
  },
  {
    data: new SlashCommandBuilder()
      .setName('재생')
      .addStringOption((option) =>
        option
          .setName('song')
          .setDescription('재생할 노래 재목 또는 링크를 적어주세요')
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
      let sucessembed = new Embed(client, 'success')
      if (!interaction.guild) {
        errembed.setTitle('❌ 이 명령어는 서버에서만 사용이 가능해요!')
        return interaction.editReply({ embeds: [errembed] })
      }
      const song = interaction.options.getString('song', true)
      const user = interaction.guild?.members.cache.get(interaction.user.id)
      const channel = user?.voice.channel
      if (!channel) {
        errembed.setTitle('❌ 음성 채널에 먼저 입장해주세요!')
        return interaction.editReply({ embeds: [errembed] })
      }
      const guildQueue = client.player.getQueue(interaction.guild.id)
      if (guildQueue) {
        if (channel.id !== interaction.guild.me?.voice.channelId) {
          errembed.setTitle('❌ 이미 다른 음성 채널에서 재생 중입니다!')
          return interaction.editReply({ embeds: [errembed] })
        }
      } else {
        if (!channel.viewable) {
          errembed.setTitle('`채널보기` 권한이 필요해요!')
          return interaction.editReply({ embeds: [errembed] })
        }
        if (!channel.joinable) {
          errembed.setTitle('`채널입장` 권한이 필요해요!')
          return interaction.editReply({ embeds: [errembed] })
        }
        if (channel.full) {
          errembed.setTitle('채널이 가득 차 입장할 수 없어요!')
          return interaction.editReply({ embeds: [errembed] })
        }
      }
      let result = (await client.player
        .search(song, { requestedBy: interaction.user })
        .catch((e) => {})) as PlayerSearchResult
      if (!result || !result.tracks.length) {
        errembed.setTitle(`❌ ${song}을 찾지 못했어요!`)
        return interaction.editReply({ embeds: [errembed] })
      }
      let queue: Queue
      if (guildQueue) {
        queue = guildQueue
        queue.metadata = interaction
      } else {
        queue = await client.player.createQueue(interaction.guild, {
          metadata: interaction
        })
      }
      try {
        if (!queue.connection) await queue.connect(channel)
      } catch (e) {
        client.player.deleteQueue(interaction.guild.id)
        errembed.setTitle(`❌ 음성 채널에 입장할 수 없어요 ${e}`)
        return interaction.editReply({ embeds: [errembed] })
      }
      if (result.playlist) {
        const buttons = [
          new MessageButton()
            .setCustomId('previousbtn')
            .setLabel('이전')
            .setStyle('SECONDARY'),
          new MessageButton()
            .setCustomId('nextbtn')
            .setLabel('다음')
            .setStyle('SUCCESS')
        ]
        const pages = []
        let page = 1
        let emptypage
        do {
          const pageStart = 10 * (page - 1)
          const pageEnd = pageStart + 10
          const tracks = result.playlist.tracks
            .slice(pageStart, pageEnd)
            .map((m, i) => {
              return `**${i + pageStart + 1}**. [${m.title}](${m.url}) ${
                m.duration
              } - ${m.requestedBy}`
            })
          if (tracks.length) {
            const embed = new Embed(client, 'success')
            embed.setDescription(
              `\n${tracks.join('\n')}${
                result.playlist.tracks.length > pageEnd
                  ? `\n... + ${result.playlist.tracks.length - pageEnd}`
                  : ''
              }`
            )
            embed.setColor('#2f3136')
            embed.setThumbnail(result.playlist.thumbnail)
            embed.setAuthor(
              `재생목록에 아래 노래들을 추가했어요!`,
              undefined,
              `${result.playlist.url}`
            )
            pages.push(embed)
            page++
          } else {
            emptypage = 1
            if (page === 1) {
              const embed = new Embed(client, 'success')
              embed.setDescription(`더 이상 재생목록에 노래가 없습니다`)
              embed.setThumbnail(result.playlist.thumbnail)
              embed.setAuthor(
                `재생목록에 아래 노래들을 추가했어요!`,
                undefined,
                `${result.playlist.url}`
              )
              embed.setColor('#2f3136')
              return interaction.editReply({ embeds: [embed] })
            }
            if (page === 2) {
              return interaction.editReply({ embeds: [pages[0]] })
            }
          }
        } while (!emptypage)
        queue.addTracks(result.tracks)
        paginationEmbed(interaction, pages, buttons, 30000)
        if (!queue.playing) return await queue.play()
      } else {
        let row = new MessageActionRow()
        let select = new MessageSelectMenu()
          .setCustomId('music.select')
          .setPlaceholder('재생할 노래를 선택해주세요!')
        let trackslist = 15
        if (result.tracks.length < 15) trackslist = result.tracks.length
        for (let i = 0; i < trackslist; i++) {
          select.addOptions([
            {
              label: `${result.tracks[i].title}`,
              description: `${result.tracks[i].author} - ${result.tracks[i].duration}`,
              value: `${i}`,
              emoji: getNumberEmogi(i + 1)
            }
          ])
        }
        row.addComponents(select)
        interaction.editReply({
          content: `<:playing:941212508784586772> **${userMention(
            interaction.user.id
          )} 노래를 선택해주세요!**`,
          components: [row]
        })
        const collector = interaction.channel?.createMessageComponentCollector({
          time: 60000
        })
        collector?.on('collect', async (i) => {
          if (i.user.id === interaction.user.id) {
            if (i.customId === 'music.select') {
              // @ts-ignore
              let index = Number(i.values[0])
              queue.addTrack(result.tracks[index])
              sucessembed.setAuthor(
                `재생목록에 노래를 추가했어요!`,
                undefined,
                result.tracks[index].url
              )
              sucessembed.setDescription(
                `[${result.tracks[index].title}](${result.tracks[index].url}) ${result.tracks[index].duration} - ${result.tracks[index].requestedBy}`
              )
              sucessembed.setThumbnail(result.tracks[index].thumbnail)
              sucessembed.setColor('#2f3136')
              interaction.editReply({
                content: ' ',
                embeds: [sucessembed],
                components: []
              })
              if (!queue.playing) return await queue.play()
            }
          }
        })
      }
    }
  }
)
