import { BaseCommand } from '../../structures/Command'
import Discord from 'discord.js'
import Embed from '../../utils/Embed'
import comma from 'comma-number'
import Schema from '../../schemas/Money'
import { SlashCommandBuilder, userMention } from '@discordjs/builders'

export default new BaseCommand(
  {
    name: 'gamble',
    description: '자신의 돈을 확인합니다.',
    aliases: ['도박', 'ehqkr']
  },
  async (client, message, args) => {
    let embed = new Embed(client, 'warn')
      .setTitle('생각하는 중...')

    let m = await message.reply({
      embeds: [embed]
    })
    const ehqkrduqn = await Schema.findOne({
      userid: message.author.id
    })
    embed = new Embed(client, 'error')
      .setTitle(`❌ 에러 발생`)
      .setDescription(message.author + '님의 정보가 확인되지 않습니다.\n먼저 \`!돈받기\`를 입력해 정보를 알려주세요!')
      .setTimestamp()
      .setColor('#2f3136')
    if (!ehqkrduqn) return m.edit({
      embeds: [embed]
    })
    embed = new Embed(client, 'error')
      .setTitle(`❌ 에러 발생`)
      .setDescription('도박하실 돈의 양이 입력되지 않았습니다.')
      .setTimestamp()
      .setColor('#2f3136')
    if (!args[0]) return m.edit({
      embeds: [embed]
    })
    embed = new Embed(client, 'error')
      .setTitle(`❌ 에러 발생`)
      .setDescription('금액정보가 올바르지 않습니다. \n특수문자가 들어가있다면 제거해주세요!(-)')
      .setTimestamp()
      .setColor('#2f3136')
    if (args.join(" ").includes("-")) return m.edit({
      embeds: [embed]
    })
    const money = parseInt(args[0]);
    embed = new Embed(client, 'error')
      .setTitle(`❌ 에러 발생`)
      .setDescription('도박은 1000원 이상부터 진행하실 수 있습니다.')
      .setTimestamp()
      .setColor('#2f3136')
    if (money < 1000) return m.edit({
      embeds: [embed]
    })
    embed = new Embed(client, 'error')
      .setTitle(`❌ 에러 발생`)
      .setDescription('보유하신 돈보다 배팅하신 돈의 금액이 많습니다. 금액 확인 부탁드립니다.')
      .setTimestamp()
      .setColor('#2f3136')
    if (money > ehqkrduqn.money) return m.edit({
      embeds: [embed]
    })
    const random = Math.floor(Math.random() * 101)
    if (random < 50) {
      embed = new Embed(client, 'success')
        .setTitle(`❌ 도박 실패`)
        .setDescription(`도박에 실패하셨습니다. 돈은 그럼 제가 쓸어 담아보겠습니다! - **${comma(money)}원**`)
        .addField("잔액 :", `**${comma(ehqkrduqn.money-money)}원**`)
        .setColor('#2f3136')
      m.edit({
        embeds: [embed]
      })
      await Schema.findOneAndUpdate({ userid: message.author.id }, {
        money: ehqkrduqn.money - money,
        userid: message.author.id,
        date: ehqkrduqn.date
      })
    } else {
      embed = new Embed(client, 'success')
        .setTitle(`⭕ 도박 성공`)
        .setDescription(`도박에 성공하셨습니다. + **${comma(money)}원**`)
        .addField("잔액 :", `**${comma(ehqkrduqn.money+money)}원**`)
        .setColor('#2f3136')
      m.edit({
        embeds: [embed]
      })
      await Schema.findOneAndUpdate({ userid: message.author.id }, {
        money: ehqkrduqn.money + money,
        userid: message.author.id,
        date: ehqkrduqn.date
      })
    }
  },
  {
    // @ts-ignore
    data: new SlashCommandBuilder()
      .setName('도박')
      .setDescription('도박을 합니다.')
      .addIntegerOption(options => options
          .setName("베팅금")
          .setDescription("도박할 금액을 최소 1000 포인트 이상 입력해주세요.")
          .setRequired(true)
          ),
    async execute(client, interaction) {
      await interaction.deferReply({ })
      let embed = new Embed(client, 'warn')
      .setTitle('처리중..')
      .setColor('#2f3136')
    let m = await interaction.editReply({
      embeds: [embed]
    })
    // let point = 
    const ehqkrduqn = await Schema.findOne({
      userid: interaction.user.id
    })
    embed = new Embed(client, 'error')
      .setTitle(`❌ 에러 발생`)
      .setDescription(interaction.user + '님의 정보가 확인되지 않습니다.\n먼저 \`!돈받기\`를 입력해 정보를 알려주세요!')
      .setTimestamp()
      .setColor('#2f3136')
    if (!ehqkrduqn) return interaction.editReply({
      embeds: [embed]
    })
    let money = interaction.options.getInteger("베팅금") || 0 //parseInt();
    embed = new Embed(client, 'error')
      .setTitle(`❌ 에러 발생`)
      .setDescription('도박은 1000원 이상부터 진행하실 수 있습니다.')
      .setTimestamp()
      .setColor('#2f3136')
    if (money < 1000) return interaction.editReply({
      embeds: [embed]
    })
    embed = new Embed(client, 'error')
      .setTitle(`❌ 에러 발생`)
      .setDescription('보유하신 돈보다 배팅하신 돈의 금액이 많습니다. 금액 확인 부탁드립니다.')
      .setTimestamp()
      .setColor('#2f3136')
    if (money > ehqkrduqn.money) return interaction.editReply({
      embeds: [embed]
    })
    const random = Math.floor(Math.random() * 101)
    if (random < 50) {
      embed = new Embed(client, 'success')
        .setTitle(`❌ 도박 실패`)
        .setDescription(`도박에 실패하셨습니다. 돈은 그럼 제가 쓸어 담아보겠습니다! - **${comma(money)}원**`)
        .addField("잔액 :", `**${comma(ehqkrduqn.money-money)}원**`)
        .setColor('#2f3136')
        interaction.editReply({
        embeds: [embed]
      })
      await Schema.findOneAndUpdate({ userid: interaction.user.id }, {
        money: ehqkrduqn.money - money,
        userid: interaction.user.id,
        date: ehqkrduqn.date
      })
    } else {
      embed = new Embed(client, 'success')
        .setTitle(`⭕ 도박 성공`)
        .setDescription(`도박에 성공하셨습니다. + **${comma(money)}원**`)
        .addField("잔액 :", `**${comma(ehqkrduqn.money+money)}원**`)
        .setColor('#2f3136')
        interaction.editReply({
        embeds: [embed]
      })
      await Schema.findOneAndUpdate({ userid: interaction.user.id }, {
        money: ehqkrduqn.money + money,
        userid: interaction.user.id,
        date: ehqkrduqn.date
      })
    }
    }
  }
)