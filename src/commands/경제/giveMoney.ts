import { BaseCommand } from '../../structures/Command';
import Discord, { SlashCommandBuilder } from 'discord.js';
import Embed from '../../utils/Embed';
import comma from 'comma-number';
import schema from '../../schemas/Money';
import Attendance from '../../schemas/attendanceSchema';
import DateFormatting from '../../utils/DateFormatting';
import dayjs from 'dayjs';
import config from '../../../config';
import Money from '../../schemas/Money';

export default new BaseCommand(
  {
    name: 'givemoney',
    description: '출석체크를 합니다.',
    aliases: ['돈받기', 'moneyget', 'ehswnj', '돈줘'],
  },
  async (client, message, args) => {
    const attendances = await Attendance.findOne({ user_id: message.author.id, date: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) } });
    let money = await Money.findOne({ userid: message.author.id });
    if (!attendances) {
      if (!money) {
        money = await Money.create({
          userid: message.author.id,
          money: 0,
        });
      }
      await Attendance.create({
        user_id: message.author.id,
        date: new Date(),
      });
      await money.updateOne({ $inc: { money: 20000 } });
      const embed = new Embed(client, 'default')
        .setTitle('⭕ 출석완료')
        .setDescription(`출석이 완료되었습니다! 출석 보상으로 20000원을 받았습니다!`)
      return message.reply({ embeds: [embed] });
    } else {
      let embed = new Embed(client, 'error')
        .setTitle('❌ 에러 발생')
        .setDescription(`이미 오늘은 출석을 하셨어요 ${DateFormatting.format(dayjs(dayjs().add(1, "day").toDate()).set('hour', 0).set('minute', 0).toDate(), 'R')}에 다시 와주세요!`)
        .addFields([
          {
            name: `하트인증`,
            value: `돈을 더 얻고 싶으시다면 \`!하트인증\`으로 돈을 더 얻으실 수 있습니다!`,
            inline: true
          }
        ]);
      return message.reply({ embeds: [embed] });
    }
  },
  {
    data: new SlashCommandBuilder()
      .setName('돈받기')
      .setDescription('출석체크를 합니다.'),
    options: {
      name: '돈받기',
      isSlash: true,
    },
    async execute(client, interaction) {
      await interaction.deferReply({ ephemeral: true });
      const attendances = await Attendance.findOne({ user_id: interaction.user.id, date: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) } });
      let money = await Money.findOne({ userid: interaction.user.id });
      if (!attendances) {
        if (!money) {
          money = await Money.create({
            userid: interaction.user.id,
            money: 0,
          });
        }
        await Attendance.create({
          user_id: interaction.user.id,
          date: new Date(),
        });
        await money.updateOne({ $inc: { money: 20000 } });
        const embed = new Embed(client, 'default')
          .setTitle('⭕ 출석완료')
          .setDescription(`출석이 완료되었습니다! 출석 보상으로 20000원을 받았습니다!`)
        return interaction.editReply({ embeds: [embed] });
      } else {
        const embed = new Embed(client, 'error')
          .setTitle('❌ 에러 발생')
          .setDescription(`이미 오늘은 출석을 하셨어요 ${DateFormatting.format(dayjs(dayjs().add(1, "day").toDate()).set('hour', 0).set('minute', 0).toDate(), 'R')}에 다시 와주세요!`)
          .addFields([
            {
              name: `하트인증`,
              value: `돈을 더 얻고 싶으시다면 \`!하트인증\`으로 돈을 더 얻으실 수 있습니다!`,
              inline: true
            }
          ]);
        return interaction.editReply({ embeds: [embed] });
      }
    },
  }
);
