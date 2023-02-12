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
    const ehqkrduqn = await Schema.findOne({
      userid: message.author.id,
    });
    const money = parseInt(args[0]);
    if (!ehqkrduqn) {
      let embed = new Embed(client, 'error')
        .setTitle(`❌ 에러 발생`)
        .setDescription('계좌가 생성되어있지 않습니다. !돈받기 입력 부탁드립니다.')
        .setTimestamp()
      return message.reply({ embeds: [embed] });
    }
    else if (isNaN(parseInt(args[0])) ?? !args[0]) {
      let embed = new Embed(client, 'error')
        .setTitle(`❌ 에러 발생`)
        .setDescription('도박하실 돈의 양이 입력되지 않았습니다.')
        .setTimestamp()
      return message.reply({ embeds: [embed] });
    }
    else if (args.join(' ').includes('-')) {
      let embed = new Embed(client, 'error')
        .setTitle(`❌ 에러 발생`)
        .setDescription('금액은 자연수만 입력해주세요.')
        .setTimestamp()
      return message.reply({ embeds: [embed] });
    }
    else if (money < 1000) {
      let embed = new Embed(client, 'error')
        .setTitle(`❌ 에러 발생`)
        .setDescription('1000원 이상부터 도박이 가능합니다.')
        .setTimestamp()
      return message.reply({ embeds: [embed] });
    }
    else if (money > ehqkrduqn.money) {
      let embed = new Embed(client, 'error')
        .setTitle(`❌ 에러 발생`)
        .setDescription('보유하신 돈보다 배팅하신 돈의 금액이 많습니다. 금액 확인 부탁드립니다.')
        .setTimestamp()
      return message.reply({ embeds: [embed], });
    }
    const random = Math.floor(Math.random() * 101);
    if (random < 60) {
      let embed = new Embed(client, 'default')
        .setTitle(`❌ 도박 실패`)
        .setDescription(`[ **${random}%** ] 확률로 도박에 실패하셨습니다. 돈은 제가 가져가겠습니다. - **${comma(money)}원**`)
        .addFields({
          name: '잔액 :',
          value: `**${comma(ehqkrduqn.money - money)}원**`,
        })
      message.reply({ embeds: [embed] });
      await Schema.findOneAndUpdate(
        { userid: message.author.id },
        {
          lastGuild: message.guild ? message.guild.id : ehqkrduqn.lastGuild,
          money: ehqkrduqn.money - money,
          userid: message.author.id,
          date: ehqkrduqn.date,
        },
      );
    } else {
      let embed = new Embed(client, 'default')
        .setTitle(`⭕ 도박 성공`)
      const randomGive = Math.floor(Math.random() * 101);
      if (randomGive <= 50) {
        embed.setDescription(`도박에 성공하여 [ **${100 - randomGive}%** ] 확률로 배팅금의 0.5배가 지급되었습니다  + **${comma(money * 0.5)}원**`)
          .addFields({
            name: '잔액 :',
            value: `**${comma(ehqkrduqn.money + (money * 0.5))}원**`,
          })
        await Schema.findOneAndUpdate(
          { userid: message.author.id },
          {
            lastGuild: message.guild ? message.guild.id : ehqkrduqn.lastGuild,
            money: ehqkrduqn.money + (money * 0.5),
            userid: message.author.id,
            date: ehqkrduqn.date,
          },
        );
      } else if (randomGive > 50 && randomGive <= 70) {
        embed.setDescription(`도박에 성공하여 [ **${100 - randomGive}%** ] 확률로 배팅금의 0.8배가 지급되었습니다  + **${comma(money * 0.8)}원**`)
          .addFields({
            name: '잔액 :',
            value: `**${comma(ehqkrduqn.money + (money * 0.8))}원**`,
          })
        await Schema.findOneAndUpdate(
          { userid: message.author.id },
          {
            lastGuild: message.guild ? message.guild.id : ehqkrduqn.lastGuild,
            money: ehqkrduqn.money + (money * 0.8),
            userid: message.author.id,
            date: ehqkrduqn.date,
          },
        );
      } else if (randomGive > 70 && randomGive <= 90) {
        embed.setDescription(`도박에 성공하여 [ **${100 - randomGive}%** ] 확률로 배팅금의 1배가 지급되었습니다  + **${comma(money)}원**`)
          .addFields({
            name: '잔액 :',
            value: `**${comma(ehqkrduqn.money + money)}원**`,
          })
        await Schema.findOneAndUpdate(
          { userid: message.author.id },
          {
            lastGuild: message.guild ? message.guild.id : ehqkrduqn.lastGuild,
            money: ehqkrduqn.money + money,
            userid: message.author.id,
            date: ehqkrduqn.date,
          },
        );
      } else if (randomGive > 90 && randomGive <= 95) {
        embed.setDescription(`도박에 성공하여 [ **${100 - randomGive}%** ] 확률로 배팅금의 1.2배가 지급되었습니다  + **${comma(money * 1.2)}원**`)
          .addFields({
            name: '잔액 :',
            value: `**${comma(ehqkrduqn.money + (money * 1.2))}원**`,
          })
        await Schema.findOneAndUpdate(
          { userid: message.author.id },
          {
            lastGuild: message.guild ? message.guild.id : ehqkrduqn.lastGuild,
            money: ehqkrduqn.money + (money * 1.2),
            userid: message.author.id,
            date: ehqkrduqn.date,
          },
        );
      } else if (randomGive > 95 && randomGive <= 97) {
        embed.setDescription(`도박에 성공하여 [ **${100 - randomGive}%** ] 확률로 배팅금의 1.5배가 지급되었습니다  + **${comma(money * 1.5)}원**`)
          .addFields({
            name: '잔액 :',
            value: `**${comma(ehqkrduqn.money + (money * 1.5))}원**`,
          })
        await Schema.findOneAndUpdate(
          { userid: message.author.id },
          {
            lastGuild: message.guild ? message.guild.id : ehqkrduqn.lastGuild,
            money: ehqkrduqn.money + (money * 1.5),
            userid: message.author.id,
            date: ehqkrduqn.date,
          },
        );
      } else if (randomGive > 97 && randomGive <= 98) {
        embed.setDescription(`도박에 성공하여 [ **${100 - randomGive}%** ] 확률로 배팅금의 1.7배가 지급되었습니다  + **${comma(money * 1.7)}원**`)
          .addFields({
            name: '잔액 :',
            value: `**${comma(ehqkrduqn.money + (money * 1.7))}원**`,
          })
        await Schema.findOneAndUpdate(
          { userid: message.author.id },
          {
            lastGuild: message.guild ? message.guild.id : ehqkrduqn.lastGuild,
            money: ehqkrduqn.money + (money * 1.7),
            userid: message.author.id,
            date: ehqkrduqn.date,
          },
        );
      } else {
        embed.setDescription(`도박에 성공하여 [ **${101 - randomGive}%** ] 확률로 배팅금의 2배가 지급되었습니다  + **${comma(money * 2)}원**`)
          .addFields({
            name: '잔액 :',
            value: `**${comma(ehqkrduqn.money + (money * 2))}원**`,
          })
        await Schema.findOneAndUpdate(
          { userid: message.author.id },
          {
            lastGuild: message.guild ? message.guild.id : ehqkrduqn.lastGuild,
            money: ehqkrduqn.money + (money * 2),
            userid: message.author.id,
            date: ehqkrduqn.date,
          },
        );
      }
      message.reply({ embeds: [embed] });
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
      let money = interaction.options.getInteger('베팅금') || 0; //parseInt();
      if (!ehqkrduqn) {
        let embed = new Embed(client, 'error')
          .setTitle(`❌ 에러 발생`)
          .setDescription('계좌가 생성되어있지 않습니다. !돈받기 입력 부탁드립니다.')
          .setTimestamp()
        return interaction.editReply({ embeds: [embed], });
      }
      else if (money < 1000) {
        let embed = new Embed(client, 'error')
          .setTitle(`❌ 에러 발생`)
          .setDescription('1000원 이상부터 도박이 가능합니다.')
          .setTimestamp()
        return interaction.editReply({ embeds: [embed] });
      }
      else if (money > ehqkrduqn.money) {
        let embed = new Embed(client, 'error')
          .setTitle(`❌ 에러 발생`)
          .setDescription('배팅하신 금액이 보유하신 금액보다 큽니다.')
          .setTimestamp()
        return interaction.editReply({ embeds: [embed] });
      }
      const random = Math.floor(Math.random() * 101);
      if (random < 60) {
        let embed = new Embed(client, 'success')
          .setTitle(`❌ 도박 실패`)
          .setDescription(
            `[ **${random}%** ] 확률로 도박에 실패하셨습니다. 돈은 제가 가져가겠습니다. - **${comma(money)}원**`,
          )
          .addFields({
            name: '잔액 :',
            value: `**${comma(ehqkrduqn.money - money)}원**`,
          })
        interaction.editReply({
          embeds: [embed],
        });
        await Schema.findOneAndUpdate(
          { userid: interaction.user.id },
          {
            lastGuild: interaction.guild ? interaction.guild.id : ehqkrduqn.lastGuild,
            money: ehqkrduqn.money - money,
            userid: interaction.user.id,
            date: ehqkrduqn.date,
          },
        );
      } else {
        let embed = new Embed(client, 'default')
          .setTitle(`⭕ 도박 성공`)
        const randomGive = Math.floor(Math.random() * 101);
        if (randomGive <= 50) {
          embed.setDescription(`도박에 성공하여 [ **${100 - randomGive}%** ] 확률로 배팅금의 0.5배가 지급되었습니다  + **${comma(money * 0.5)}원**`)
            .addFields({
              name: '잔액 :',
              value: `**${comma(ehqkrduqn.money + (money * 0.5))}원**`,
            })
          await Schema.findOneAndUpdate(
            { userid: interaction.user.id },
            {
              lastGuild: interaction.guild ? interaction.guild.id : ehqkrduqn.lastGuild,
              money: ehqkrduqn.money + (money * 0.5),
              userid: interaction.user.id,
              date: ehqkrduqn.date,
            },
          );
        } else if (randomGive > 50 && randomGive <= 70) {
          embed.setDescription(`도박에 성공하여 [ **${100 - randomGive}%** ] 확률로 배팅금의 0.8배가 지급되었습니다  + **${comma(money * 0.8)}원**`)
            .addFields({
              name: '잔액 :',
              value: `**${comma(ehqkrduqn.money + (money * 0.8))}원**`,
            })
          await Schema.findOneAndUpdate(
            { userid: interaction.user.id },
            {
              lastGuild: interaction.guild ? interaction.guild.id : ehqkrduqn.lastGuild,
              money: ehqkrduqn.money + (money * 0.8),
              userid: interaction.user.id,
              date: ehqkrduqn.date,
            },
          );
        } else if (randomGive > 70 && randomGive <= 90) {
          embed.setDescription(`도박에 성공하여 [ **${100 - randomGive}%** ] 확률로 배팅금의 1배가 지급되었습니다  + **${comma(money)}원**`)
            .addFields({
              name: '잔액 :',
              value: `**${comma(ehqkrduqn.money + money)}원**`,
            })
          await Schema.findOneAndUpdate(
            { userid: interaction.user.id },
            {
              lastGuild: interaction.guild ? interaction.guild.id : ehqkrduqn.lastGuild,
              money: ehqkrduqn.money + money,
              userid: interaction.user.id,
              date: ehqkrduqn.date,
            },
          );
        } else if (randomGive > 90 && randomGive <= 95) {
          embed.setDescription(`도박에 성공하여 [ **${100 - randomGive}%** ] 확률로 배팅금의 1.2배가 지급되었습니다  + **${comma(money * 1.2)}원**`)
            .addFields({
              name: '잔액 :',
              value: `**${comma(ehqkrduqn.money + (money * 1.2))}원**`,
            })
          await Schema.findOneAndUpdate(
            { userid: interaction.user.id },
            {
              lastGuild: interaction.guild ? interaction.guild.id : ehqkrduqn.lastGuild,
              money: ehqkrduqn.money + (money * 1.2),
              userid: interaction.user.id,
              date: ehqkrduqn.date,
            },
          );
        } else if (randomGive > 95 && randomGive <= 97) {
          embed.setDescription(`도박에 성공하여 [ **${100 - randomGive}%** ] 확률로 배팅금의 1.5배가 지급되었습니다  + **${comma(money * 1.5)}원**`)
            .addFields({
              name: '잔액 :',
              value: `**${comma(ehqkrduqn.money + (money * 1.5))}원**`,
            })
          await Schema.findOneAndUpdate(
            { userid: interaction.user.id },
            {
              lastGuild: interaction.guild ? interaction.guild.id : ehqkrduqn.lastGuild,
              money: ehqkrduqn.money + (money * 1.5),
              userid: interaction.user.id,
              date: ehqkrduqn.date,
            },
          );
        } else if (randomGive > 97 && randomGive <= 98) {
          embed.setDescription(`도박에 성공하여 [ **${100 - randomGive}%** ] 확률로 배팅금의 1.7배가 지급되었습니다  + **${comma(money * 1.7)}원**`)
            .addFields({
              name: '잔액 :',
              value: `**${comma(ehqkrduqn.money + (money * 1.7))}원**`,
            })
          await Schema.findOneAndUpdate(
            { userid: interaction.user.id },
            {
              lastGuild: interaction.guild ? interaction.guild.id : ehqkrduqn.lastGuild,
              money: ehqkrduqn.money + (money * 1.7),
              userid: interaction.user.id,
              date: ehqkrduqn.date,
            },
          );
        } else {
          embed.setDescription(`도박에 성공하여 [ **${101 - randomGive}%** ] 확률로 배팅금의 2배가 지급되었습니다  + **${comma(money * 2)}원**`)
            .addFields({
              name: '잔액 :',
              value: `**${comma(ehqkrduqn.money + (money * 2))}원**`,
            })
          await Schema.findOneAndUpdate(
            { userid: interaction.user.id },
            {
              lastGuild: interaction.guild ? interaction.guild.id : ehqkrduqn.lastGuild,
              money: ehqkrduqn.money + (money * 2),
              userid: interaction.user.id,
              date: ehqkrduqn.date,
            },
          );
        }
        interaction.editReply({ embeds: [embed] })
      }
    },
  },
);
