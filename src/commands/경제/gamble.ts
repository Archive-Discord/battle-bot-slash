import { BaseCommand } from '../../structures/Command';
import Discord from 'discord.js';
import Embed from '../../utils/Embed';
import comma from 'comma-number';
import Schema from '../../schemas/Money';
import { SlashCommandBuilder, userMention } from '@discordjs/builders';

export default new BaseCommand(
  {
    name: 'gamble',
    description: '자신의 돈을 확인합니다.',
    aliases: ['도박', 'ehqkr'],
  },
  async (client, message, args) => {
    let embed = new Embed(client, 'warn')
      .setTitle(client.i18n.t('main.title.loading'))
      .setColor('#2f3136');
    let m = await message.reply({
      embeds: [embed],
    });
    const ehqkrduqn = await Schema.findOne({
      userid: message.author.id,
    });
    embed = new Embed(client, 'error')
      .setTitle(client.i18n.t('main.title.error'))
      .setDescription(client.i18n.t('commands.gamble.description.account'))
      .setTimestamp()
      .setColor('#2f3136');
    if (!ehqkrduqn)
      return m.edit({
        embeds: [embed],
      });
    embed = new Embed(client, 'error')
      .setTitle(client.i18n.t('main.title.error'))
      .setDescription(client.i18n.t('commands.gamble.description.scanmoney'))
      .setTimestamp()
      .setColor('#2f3136');
    if (!args[0])
      return m.edit({
        embeds: [embed],
      });
    embed = new Embed(client, 'error')
      .setTitle(client.i18n.t('main.title.error'))
      .setDescription(client.i18n.t('commands.gamble.description.int'))
      .setTimestamp()
      .setColor('#2f3136');
    if (args.join(' ').includes('-'))
      return m.edit({
        embeds: [embed],
      });
    const money = parseInt(args[0]);
    embed = new Embed(client, 'error')
      .setTitle(client.i18n.t('main.title.error'))
      .setDescription(client.i18n.t('commands.gamble.description.toolow'))
      .setTimestamp()
      .setColor('#2f3136');
    if (money < 1000)
      return m.edit({
        embeds: [embed],
      });
    embed = new Embed(client, 'error')
      .setTitle(client.i18n.t('main.title.error'))
      .setDescription(client.i18n.t('commands.gamble.description.toomany'))
      .setTimestamp()
      .setColor('#2f3136');
    if (money > ehqkrduqn.money)
      return m.edit({
        embeds: [embed],
      });
    const random = Math.floor(Math.random() * 101);
    if (random < 56) {
      embed = new Embed(client, 'success')
        .setTitle(client.i18n.t('commands.gamble.title.fail'))
        .setDescription(
          client.i18n.t('commands.gamble.description.fail', {
            money: comma(money),
          }),
        )
        .addFields({
          name: client.i18n.t('commands.gamble.fields.name'),
          value: client.i18n.t('commands.gamble.fields.value', {
            fmoney: comma(ehqkrduqn.money - money),
          }),
        })
        .setColor('#2f3136');
      m.edit({
        embeds: [embed],
      });
      await Schema.findOneAndUpdate(
        { userid: message.author.id },
        {
          money: ehqkrduqn.money - money,
          userid: message.author.id,
          date: ehqkrduqn.date,
        },
      );
    } else {
      embed = new Embed(client, 'success')
        .setTitle(client.i18n.t('commands.gamble.title.success'))
        .setDescription(
          client.i18n.t('commands.gamble.description.success', {
            money: comma(money),
          }),
        )
        .addFields({
          name: client.i18n.t('commands.gamble.fields.name'),
          value: client.i18n.t('commands.gamble.fields.value', {
            fmoney: comma(ehqkrduqn.money + money),
          }),
        })
        .setColor('#2f3136');
      m.edit({
        embeds: [embed],
      });
      await Schema.findOneAndUpdate(
        { userid: message.author.id },
        {
          money: ehqkrduqn.money + money,
          userid: message.author.id,
          date: ehqkrduqn.date,
        },
      );
    }
  },
  {
    // @ts-ignore
    data: new SlashCommandBuilder()
      .setName('도박')
      .setDescription('도박을 합니다.')
      .addIntegerOption((options) =>
        options
          .setName('베팅금')
          .setDescription('도박할 금액을 최소 1000 포인트 이상 입력해주세요.')
          .setRequired(true),
      ),
    async execute(client, interaction) {
      await interaction.deferReply({ ephemeral: true });
      const ehqkrduqn = await Schema.findOne({
        userid: interaction.user.id,
      });
      let embed = new Embed(client, 'error')
        .setTitle(client.i18n.t('main.title.error'))
        .setDescription(client.i18n.t('commands.gamble.description.account'))
        .setTimestamp()
        .setColor('#2f3136');
      if (!ehqkrduqn)
        return interaction.editReply({
          embeds: [embed],
        });
      let money = interaction.options.getInteger('베팅금') || 0; //parseInt();
      embed = new Embed(client, 'error')
        .setTitle(client.i18n.t('main.title.error'))
        .setDescription(client.i18n.t('commands.gamble.description.toolow'))
        .setTimestamp()
        .setColor('#2f3136');
      if (money < 1000)
        return interaction.editReply({
          embeds: [embed],
        });
      embed = new Embed(client, 'error')
        .setTitle(client.i18n.t('main.title.error'))
        .setDescription(client.i18n.t('commands.gamble.description.toomany'))
        .setTimestamp()
        .setColor('#2f3136');
      if (money > ehqkrduqn.money)
        return interaction.editReply({
          embeds: [embed],
        });
      const random = Math.floor(Math.random() * 101);
      if (random < 56) {
        embed = new Embed(client, 'success')
          .setTitle(client.i18n.t('commands.gamble.title.fail'))
          .setDescription(
            client.i18n.t('commands.gamble.description.fail', {
              money: comma(money),
            }),
          )
          .addFields({
            name: client.i18n.t('commands.gamble.fields.name'),
            value: client.i18n.t('commands.gamble.fields.value', {
              fmoney: comma(ehqkrduqn.money - money),
            }),
          })
          .setColor('#2f3136');
        interaction.editReply({
          embeds: [embed],
        });
        await Schema.findOneAndUpdate(
          { userid: interaction.user.id },
          {
            money: ehqkrduqn.money - money,
            userid: interaction.user.id,
            date: ehqkrduqn.date,
          },
        );
      } else {
        embed = new Embed(client, 'success')
          .setTitle(client.i18n.t('commands.gamble.title.success'))
          .setDescription(
            client.i18n.t('commands.gamble.description.success', {
              money: comma(money),
            }),
          )
          .addFields({
            name: client.i18n.t('commands.gamble.fields.name'),
            value: client.i18n.t('commands.gamble.fields.value', {
              fmoney: comma(ehqkrduqn.money + money),
            }),
          })
          .setColor('#2f3136');
        interaction.editReply({
          embeds: [embed],
        });
        await Schema.findOneAndUpdate(
          { userid: interaction.user.id },
          {
            money: ehqkrduqn.money + money,
            userid: interaction.user.id,
            date: ehqkrduqn.date,
          },
        );
      }
    },
  },
);
