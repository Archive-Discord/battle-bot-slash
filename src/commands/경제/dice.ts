import { BaseCommand, SlashCommand } from '../../structures/Command'
import Embed from '../../utils/Embed'
import { SlashCommandBuilder } from 'discord.js'
import MoneySchema from '../../schemas/Money';
import DiceGameSchema from '../../schemas/diceGameSchema'
import comma from 'comma-number';

export default new BaseCommand(
  {
    name: 'dice',
    description: '주사위 게임을 진행합니다.',
    aliases: ['주사위']
  },
  async (client, message, args) => {
    let embed = new Embed(client, 'error')
      .setTitle(`❌ 에러 발생`)
      .setDescription('해당 명령어는 슬래쉬 커맨드 ( / )로만 사용이 가능합니다.')
      .addFields([
        {
          name: `지원 종료 안내`,
          value: `해당 커맨드는 5월 5일 이후로 사용이 불가능한 커맨드입니다.`,
          inline: true
        }
      ]);
    return message.reply({ embeds: [embed] });
  },
  {
    data: new SlashCommandBuilder()
      .setName('주사위')
      .setDescription('주사위 게임을 진행합니다.')
      .addIntegerOption((option) =>
        option
          .setName('배팅금액')
          .setDescription('배팅할 금액을 입력해주세요.')
          .setRequired(true)
      ) as SlashCommandBuilder,
    async execute(client, interaction) {
      let user = await MoneySchema.findOne({ userid: interaction.user.id });
      if (!user) {
        let embed = new Embed(client, 'error')
          .setTitle(`❌ 에러 발생`)
          .setDescription(interaction.user.username + '님의 계좌가 생성되지 않으셨습니다. \n`/돈받기`로 계좌를 생성해주세요!')
          .setTimestamp()
        return interaction.reply({ embeds: [embed] });
      }
      const betting = interaction.options.getInteger('배팅금액')
      if (typeof betting !== 'number' || !betting) {
        const useageEmbed = new Embed(client, 'info')
          .setTitle('주사위 게임')
          .setDescription(
            '**사용법**\n> ' + client.config.bot.prefix + '주사위 <배팅 금액>'
          )
        await interaction.reply({
          embeds: [useageEmbed]
        })
        return
      }

      if (betting > user.money) {
        const noMoneyEmbed = new Embed(client, 'error')
          .setTitle('주사위 게임')
          .setDescription(
            `주사위 게임을 진행하기 위한 금액이 부족합니다 - 현재 잔액: ${comma(
              user.money
            )}원`
          )
        await interaction.reply({
          embeds: [noMoneyEmbed]
        })
        return
      }

      const diceEmbed = new Embed(client, 'info')

      const userDice = Math.floor(Math.random() * 6) + 1
      const botDice = Math.floor(Math.random() * 6) + 1

      const diceMessage = await interaction.reply({
        embeds: [
          diceEmbed
            .setTitle('🎲 주사위를 굴리는 중..')
            .setDescription(
              `> 배팅 금액: ${comma(
                betting
              )}원\n\n> 유저: **${userDice} +**\n> 봇:** ${botDice} +**\n\n> ${interaction.user.username
              }님의 잔액: ${comma(user.money)}`
            )
        ]
      })

      const userDice2 = Math.floor(Math.random() * 6) + 1
      const botDice2 = Math.floor(Math.random() * 6) + 1

      const userSum = userDice + userDice2
      const botSum = botDice + botDice2

      await diceMessage.edit({
        embeds: [
          diceEmbed
            .setTitle(`🎲 주사위를 굴렸습니다!`)
            .setDescription(
              `> 배팅 금액: ${comma(
                betting
              )}원\n\n> 유저: **${userDice} + ${userDice2}**\n> 봇: **${botDice} + ${botDice2}**\n\n> ${interaction.user.username
              }님의 잔액: ${comma(user.money)}`
            )
        ]
      })

      await diceMessage.edit({
        embeds: [
          diceEmbed
            .setTitle(
              `🎲 주사위를 굴렸습니다! ${userSum === botSum
                ? '무승부'
                : userSum > botSum
                  ? `승리 (+ ${comma(betting)}원)`
                  : `패배 (- ${comma(betting)}원)`
              }`
            )
            .setDescription(
              `> 배팅 금액: ${comma(
                betting
              )}원\n\n> 유저: **${userDice} + ${userDice2} = ${userDice + userDice2
              }**\n> 봇: **${botDice} + ${botDice2} = ${botDice + botDice2
              }**\n\n> ${interaction.user.username}님의 잔액: ${userSum === botSum
                ? comma(user.money)
                : userSum > botSum
                  ? comma(user.money + betting)
                  : comma(user.money - betting)
              }`
            )
            .setColor(
              userSum === botSum
                ? 'Grey'
                : userSum > botSum
                  ? '#57F287'
                  : '#ED4245'
            )
        ]
      })

      await DiceGameSchema.create({
        userId: user.id,
        betted: betting,
        winType:
          userSum === botSum ? 'DRAWN' : userSum > botSum ? 'WIN' : 'LOSE'
      })

      if (userSum > botSum) {
        await MoneySchema.updateOne(
          { userid: interaction.user.id },
          {
            $set: {
              money: user.money + Math.round(betting / 1.5)
            }
          }
        )
      } else if (userSum < botSum) {
        await MoneySchema.updateOne(
          { userid: interaction.user.id },
          {
            $set: {
              money: user.money - betting
            }
          }
        )
      }
    }
  }
)