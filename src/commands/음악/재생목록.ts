// @ts-nocheck
/* eslint-disable no-unused-vars */

// Slash command and Message Command
import { SlashCommandBuilder } from '@discordjs/builders'
import { CommandInteraction, Message, EmbedBuilder } from 'discord.js'
import { BaseCommand } from '../../structures/Command'
import Embed from '../../utils/Embed'

export default new BaseCommand({
  name: '재생목록',
  description: '',
  aliases: ["playlist", "재생목록", "wotodahrfhr"],
}, async (client, message, args) => {
  message.reply('빗금으로 이전되었습니다.')
}, {
  data: new SlashCommandBuilder()
    .setName("재생목록")
    .setDescription("재생목록을 표시해요."),
  options: {
    isSlash: true,
  },
  async execute(client, interaction) {
    if (!interaction.member || !interaction.member.voice.channel) return interaction.reply({
      embeds: [
        new Embed(client, 'default')
          .setDescription(`음성채널에 먼저 참여해주세요!`)
      ]
    })
    const queue = client.manager.create({
      guild: interaction.guild.id,
      voiceChannel: interaction.member.voice.channel.id,
      textChannel: interaction.channel.id,
    });

    if (!queue || !queue.playing) return interaction.reply({
      embeds: [
        new Embed(client, 'default')
          .setDescription(`현재 재생되고 있는 음악이 없습니다.`)
      ]
    })
    function format(millis) {
      try {
        var s = Math.floor((millis / 1000) % 60);
        var m = Math.floor((millis / (1000 * 60)) % 60);
        var h = Math.floor((millis / (1000 * 60 * 60)) % 24);
        h = h < 10 ? "0" + h : h;
        m = m < 10 ? "0" + m : m;
        s = s < 10 ? "0" + s : s;
        return h + ":" + m + ":" + s + " | " + Math.floor((millis / 1000)) + " 초"
      } catch (e) {
        console.log(String(e.stack).grey.bgRed)
      }
    }
    // if (interaction.member.voice.channel.id !== interaction.guild.me.voice.channel.id) return interaction.reply({
    //   embeds: [
    //     new Embed(client, 'default')
    //       .setDescription(`명령어를 사용하시려면 ${client.user} 봇이랑 같은 음성채널에 참여해야됩니다!`)
    //   ]
    // })
    const tracks = queue.queue;
    var maxTracks = 10; //tracks / Queue Page
    var songs = tracks.slice(0, maxTracks);

    const embed = new Embed(client, 'music')
      .setTitle(`재생목록 \`${interaction.guild.name}\``)
      .addFields(
        { name: `**\` N. \` *${queue.queue.length > maxTracks ? queue.queue.length - maxTracks : queue.queue.length} 개의 노래가 대기중 ...***`, value: `\u200b` },
        { name: `**\` 0. \` __재생중인 노래__**`, value: `**${queue.queue.current.uri ? `[${queue.queue.current.title.substr(0, 60).replace(/\[/igu, "\\[").replace(/\]/igu, "\\]")}](${queue.queue.current.uri})` : queue.queue.current.title}** - \`${queue.queue.current.isStream ? `LIVE STREAM` : format(queue.queue.current.duration).split(` | `)[0]}\`\n> 신청자: __${queue.queue.current.requester.tag}__` },
      )
    // .setDescription(String(songs.map((track, index) => `**\` ${++index}. \` ${track.uri ? `[${track.title.substr(0, 60).replace(/\[/igu, "\\[").replace(/\]/igu, "\\]")}](${track.uri})` : track.title}** - \`${track.isStream ? `LIVE STREAM` : format(track.duration).split(` | `)[0]}\`\n> 신청자: __${track.requester.tag}__`).join(`\n`)).substr(0, 2048))
    //주석된거 이거 에러가 나서 팔넴님한테 도움요청 해야됩니다.
    return void interaction.reply({ embeds: [embed] });
  }
})