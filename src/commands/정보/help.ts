import config from '../../../config';
import { BaseCommand } from '../../structures/Command';
import Embed from '../../utils/Embed';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder } from 'discord.js';

export default new BaseCommand(
  {
    name: 'help',
    description: '봇의 도움말을 보여줍니다',
    aliases: ['도움말', 'ehdna', 'ehdnaakf', '도움'],
  },
  async (client, message, args) => {
    let buttton = new ButtonBuilder()
      .setLabel('하트 누르기')
      .setURL('https://koreanbots.dev/bots/928523914890608671/vote')
      .setStyle(ButtonStyle.Link);
    let row = new ActionRowBuilder<ButtonBuilder>().addComponents(buttton);
    let embed = new Embed(client, 'success')
      .setTitle(`${client.user?.username} 도움말`)
      .setColor('#2f3136');
    if (!args[0]) {
      client.categorys.forEach((category, command) => {
        if (command === 'dev') return;
        embed.setDescription(`아래에 있는 명령어들을 이용해 도움말을 보실 수 있습니다.`);
        embed.addFields({
          name: `\`${config.bot.prefix}도움말 ${command}\``,
          value: `> ${command}관련 명령어들을 보내드려요!`,
          inline: true,
        });
      });
      return message.reply({ embeds: [embed], components: [row] });
    } else {
      let commands = client.categorys.get(args[0]);
      if (args[0] === 'dev') {
        // @ts-ignore
        if (!client.dokdo.owners.includes(message.author.id)) {
          embed
            .setTitle(`❌ 에러 발생`)
            .setDescription(`존재하지 않는 카테고리입니다.`)
            .setType('error');
          return message.reply({ embeds: [embed], components: [row] });
        }
      }
      if (!commands) {
        embed
          .setTitle(`❌ 에러 발생`)
          .setDescription(`존재하지 않는 카테고리입니다.`)
          .setType('error');
        return message.reply({ embeds: [embed], components: [row] });
      }
      embed.setDescription(`${args[0]} 관련 도움말 입니다!`);
      commands.forEach((command) => {
        embed.addFields({
          name: `\`${config.bot.prefix}${command.name}\``,
          value: `> ${command.description}`,
          inline: true,
        });
      });
      return message.reply({ embeds: [embed], components: [row] });
    }
  },
  {
    data: new SlashCommandBuilder()
      .setName('도움말')
      .addStringOption((option) =>
        option
          .setName('category')
          .setDescription('카테고리를 적어주세요')
          .setAutocomplete(true)
          .setRequired(false),
      )
      .setDescription('봇의 도움말을 보여줍니다'),
    options: {
      name: '도움말',
      isSlash: true,
    },
    async execute(client, interaction) {
      let buttton = new ButtonBuilder()
        .setLabel('하트 누르기')
        .setURL('https://koreanbots.dev/bots/928523914890608671/vote')
        .setStyle(ButtonStyle.Link);
      let row = new ActionRowBuilder<ButtonBuilder>().addComponents(buttton);
      let embed = new Embed(client, 'success')
        .setColor('#2f3136')
        .setTitle(`${client.user?.username} 도움말`);
      if (!interaction.options.getString('category')) {
        client.categorys.forEach((category, command) => {
          if (command === 'dev') return;
          embed.setDescription(`아래에 있는 명령어들을 이용해 도움말을 보세요!`);
          embed.addFields({
            name: `\`/도움말 ${command}\``,
            value: `> ${command}관련 명령어들을 보내드려요!`,
            inline: true,
          });
        });
        return interaction.reply({ embeds: [embed], components: [row] });
      } else {
        let category = interaction.options.getString('category')?.toLowerCase();
        if (category === 'dev') {
          // @ts-ignore
          if (!client.dokdo.owners.includes(message.author.id)) {
            embed
              .setTitle(`❌ 에러 발생`)
              .setDescription(`존재하지 않는 카테고리입니다.`)
              .setType('error');
            return interaction.reply({ embeds: [embed], components: [row] });
          }
        }
        let commands = client.categorys.get(category as string);
        if (!commands) {
          embed
            .setTitle(`❌ 에러 발생`)
            .setDescription(`존재하지 않는 카테고리입니다.`)
            .setType('error');
          return interaction.reply({ embeds: [embed], components: [row] });
        }
        embed.setDescription(`${category} 관련 도움말 입니다!`);
        let isSlash = commands?.filter((x) => x.isSlash);
        if (isSlash?.length === 0) {
          embed.setTitle(`❌ 에러 발생`);
          embed.setDescription(`${category} 카테고리에는 사용 가능한 (/) 명령어가 없어요`);
        } else {
          commands.forEach((command) => {
            if (!command.isSlash) return;
            embed.addFields({
              name: `\`/${command.name}\``,
              value: `> ${command.description}`,
            });
          });
        }
        return interaction.reply({ embeds: [embed], components: [row] });
      }
    },
  },
);
