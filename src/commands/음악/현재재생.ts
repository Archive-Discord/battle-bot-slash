// @ts-nocheck
/* eslint-disable no-unused-vars */

// Slash command and Message Command
import { SlashCommandBuilder } from '@discordjs/builders'
import { CommandInteraction, Message, EmbedBuilder } from 'discord.js'
import { BaseCommand } from '../../structures/Command'
import Embed from '../../utils/Embed'

export default new BaseCommand({
  name: '현재재생',
  description: '',
  aliases: ["nowplaying", "현재재생", "guswowotod"],
}, async (client, message, args) => {
  message.reply('빗금으로 이전되었습니다.')
}, {
  data: new SlashCommandBuilder()
    .setName("현재재생")
    .setDescription("현재 재생중인 곡을 표시해요."),
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

    // if (interaction.member.voice.channel.id !== interaction.guild.me.voice.channel.id) return interaction.reply({
    //   embeds: [
    //     new Embed(client, 'default')
    //       .setDescription(`명령어를 사용하시려면 ${client.user} 봇이랑 같은 음성채널에 참여해야됩니다!`)
    //   ]
    // })
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
    const config = {
      progress_bar: {
        style: "simple",
        __comment__: "styles: 'simple', 'comlex'",
        leftindicator: "[",
        rightindicator: "]",
        slider: "🔘",
        size: 25,
        line: "▬",
        ___comment___: "those are for the complex style",
        empty_left: "<:left_empty:909415753265086504>",
        filled_left: "<:left_filled:909415753692897300>",
        empty_right: "<:right_empty:909415753416056832>",
        filled_right: "<:right_filled:909415753135042562>",
        emptyframe: "<:middle_empty:909415753059545139>",
        filledframe: "<:middle_filled:909415753462218792>"
      }
    }
    function createBar(player) {
      let { size, line, slider, leftindicator, rightindicator, style } = config.progress_bar;
      if (style == "simple") {
        //player.queue.current.duration == 0 ? player.position : player.queue.current.duration, player.position, 25, "▬", "🔷")
        if (!player.queue.current) return `**[${slider}${line.repeat(size - 1)}${rightindicator}**\n**00:00:00 / 00:00:00**`;
        let current = player.queue.current.duration !== 0 ? player.position : player.queue.current.duration;
        let total = player.queue.current.duration;

        let bar = current > total ? [line.repeat(size / 2 * 2), (current / total) * 100] : [line.repeat(Math.round(size / 2 * (current / total))).replace(/.$/, slider) + line.repeat(size - Math.round(size * (current / total)) + 1), current / total];
        if (!String(bar).includes(slider)) return `**${leftindicator}${slider}${line.repeat(size - 1)}${rightindicator}**\n**00:00:00 / 00:00:00**`;
        return `**${leftindicator}${bar[0]}${rightindicator}**\n**${new Date(player.position).toISOString().substr(11, 8) + " / " + (player.queue.current.duration == 0 ? " ◉ LIVE" : new Date(player.queue.current.duration).toISOString().substr(11, 8))}**`;
      } else {
        try {
          if (!player.queue.current) return `**${emoji.msg.progress_bar.empty_left}${emoji.msg.progress_bar.filledframe}${emoji.msg.progress_bar.emptyframe.repeat(size - 1)}${emoji.msg.progress_bar.empty_right}**\n**00:00:00 / 00:00:00**`;
          let current = player.queue.current.duration !== 0 ? player.position : player.queue.current.duration;
          let total = player.queue.current.duration;
          size -= 10;
          let rightside = size - Math.round(size * (current / total));
          let leftside = Math.round(size * (current / total));
          let bar;
          if (leftside < 1) bar = String(emoji.msg.progress_bar.empty_left) + String(emoji.msg.progress_bar.emptyframe).repeat(rightside) + String(emoji.msg.progress_bar.empty_right);
          else bar = String(emoji.msg.progress_bar.filled_left) + String(emoji.msg.progress_bar.filledframe).repeat(leftside) + String(emoji.msg.progress_bar.emptyframe).repeat(rightside) + String(size - rightside !== 1 ? emoji.msg.progress_bar.empty_right : emoji.msg.progress_bar.filled_right);
          return `**${bar}**\n**${new Date(player.position).toISOString().substr(11, 8) + " / " + (player.queue.current.duration == 0 ? " ◉ LIVE" : new Date(player.queue.current.duration).toISOString().substr(11, 8))}**`;
        } catch (e) {
          //if problem, then redo with the new size
          if (!player.queue.current) return `**[${slider}${line.repeat(size - 1)}${rightindicator}**\n**00:00:00 / 00:00:00**`;
          let current = player.queue.current.duration !== 0 ? player.position : player.queue.current.duration;
          let total = player.queue.current.duration;

          let bar = current > total ? [line.repeat(size / 2 * 2), (current / total) * 100] : [line.repeat(Math.round(size / 2 * (current / total))).replace(/.$/, slider) + line.repeat(size - Math.round(size * (current / total)) + 1), current / total];
          if (!String(bar).includes(slider)) return `**${leftindicator}${slider}${line.repeat(size - 1)}${rightindicator}**\n**00:00:00 / 00:00:00**`;
          return `**${leftindicator}${bar[0]}${rightindicator}**\n**${new Date(player.position).toISOString().substr(11, 8) + " / " + (player.queue.current.duration == 0 ? " ◉ LIVE" : new Date(player.queue.current.duration).toISOString().substr(11, 8))}**`;
        }
      }
    }
    const embed = new Embed(client, 'success')
      .setAuthor({ name: `${client.user.tag}`, iconURL: interaction.guild.iconURL({ dynamic: true }) })
      .setThumbnail(`https://img.youtube.com/vi/${queue.queue.current.identifier}/mqdefault.jpg`)
      .setURL(queue.queue.current.uri)
      .setTitle(`${queue.queue.current.title}`)
      .addFields(
        { name: `재생률`, value: `${createBar(queue)}` },
        { name: `노래시간`, value: `\`${format(queue.queue.current.duration).split(" | ")[0]}\` | \`${format(queue.queue.current.duration).split(" | ")[1]}\``, inline: true },
        { name: `제작자`, value: `\`${queue.queue.current.author}\``, inline: true },
        { name: `남은 노래`, value: `\`${queue.queue.length} 개\``, inline: true },
      )
      .setFooter({ text: `${queue.queue.current.requester.tag}`, iconURL: queue.queue.current.requester.displayAvatarURL({ dynamic: true }) })


    return void interaction.reply({ embeds: [embed] });
  }
})