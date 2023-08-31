import { SlashCommandBuilder } from '@discordjs/builders';
import { ButtonStyle, version } from 'discord.js';
import config from '../../../config';
import { repository } from '../../../package.json';
import { BaseCommand } from '../../structures/Command';
import DateFormatting from '../../utils/DateFormatting';
import Embed from '../../utils/Embed';
import { ActionRowBuilder, ButtonBuilder } from 'discord.js';
const memory = () => {
  const memory = process.memoryUsage().rss;
  return (memory / 1024 / 1024).toFixed(2) + 'MB';
};
export default new BaseCommand(
  {
    name: 'info',
    description: '봇의 정보를 보여줍니다',
    aliases: ['정보', 'info', 'wjdqh'],
  },
  async (client, message, args) => {
    let buttton = new ButtonBuilder()
      .setLabel('하트 누르기')
      .setURL('https://koreanbots.dev/bots/928523914890608671/vote')
      .setStyle(ButtonStyle.Link);
    let row = new ActionRowBuilder<ButtonBuilder>().addComponents(buttton);
    let embed = new Embed(client, 'default')
      .setTitle(`${client.user?.username} 정보`)
      .setColor('#2f3136');
    let shardEmbed;
    shardEmbed = `**서버의 Shard ID#${message.guild?.shard.id} ${client.ws.ping}ms**\n`;
    embed.setDescription(shardEmbed);
    embed.addFields({
      name: '서버 수',
      value: `${client.guilds.cache.size}서버`,
      inline: true,
    });
    embed.addFields({
      name: '유저 수',
      value: `${client.guilds.cache.reduce((a, b) => a + b.memberCount, 0)}명`,
      inline: true,
    });
    embed.addFields({
      name: '업타임',
      value: `${DateFormatting.format(new Date(Date.now() - process.uptime() * 1000), 'R')}`,
      inline: true,
    });
    embed.addFields({
      name: '시스템정보',
      value: `\`\`\`diff\n- Discord.js: ${version} \n- Node.js: ${process.version}\n- OS: ${process.platform
        } - Memory: ${memory()} \`\`\``,
    });
    embed.addFields({
      name: '유용한 링크',
      value: `[서포트 서버](https://discord.gg/WtGq7D7BZm) | [웹 대시보드](${config.web.baseurl}) | [깃허브](${repository}) | [개인정보처리방침](${config.web.baseurl}/privacy) | [상태](${config.web.baseurl}/status)`,
    });
    return message.reply({ embeds: [embed], components: [row] });
  },
  {
    data: new SlashCommandBuilder().setName('정보').setDescription('봇의 정보를 보여줍니다'),
    options: {
      name: '정보',
      isSlash: true,
    },
    async execute(client, interaction) {
      let buttton = new ButtonBuilder()
        .setLabel('하트 누르기')
        .setURL('https://koreanbots.dev/bots/928523914890608671/vote')
        .setStyle(ButtonStyle.Link);
      let row = new ActionRowBuilder<ButtonBuilder>().addComponents(buttton);
      let embed = new Embed(client, 'default')
        .setTitle(`${client.user?.username} 정보`)
        .setColor('#2f3136');
      let shardEmbed;
      shardEmbed = `**서버의 Shard ID#${interaction.guild?.shard.id} ${client.ws.ping}ms**\n`;
      embed.setDescription(shardEmbed);
      embed.addFields({
        name: '서버 수',
        value: `${client.guilds.cache.size}서버`,
        inline: true,
      });
      embed.addFields({
        name: '유저 수',
        value: `${client.guilds.cache.reduce((a, b) => a + b.memberCount, 0)}명`,
        inline: true,
      });
      embed.addFields({
        name: '업타임',
        value: `${DateFormatting.format(new Date(Date.now() - process.uptime() * 1000), 'R')}`,
        inline: true,
      });
      embed.addFields({
        name: '시스템정보',
        value: `\`\`\`diff\n- Discord.js: ${version} \n- Node.js: ${process.version}\n- OS: ${process.platform
          } - Memory: ${memory()} \`\`\``,
      });
      embed.addFields({
        name: '유용한 링크',
        value: `[서포트 서버](https://discord.gg/WtGq7D7BZm) | [웹 대시보드](${config.web.baseurl}) | [깃허브](${repository}) | [개인정보처리방침](${config.web.baseurl}/privacy) | [상태](https://status.battlebot.kr)`,
      });
      return interaction.reply({
        embeds: [embed],
        components: [row],
        ephemeral: true,
      });
    },
  },
);
