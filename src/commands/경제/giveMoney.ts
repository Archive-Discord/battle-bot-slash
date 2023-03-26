import { BaseCommand } from '../../structures/Command';
import Discord, { SlashCommandBuilder } from 'discord.js';
import Embed from '../../utils/Embed';
import comma from 'comma-number';
import schema from '../../schemas/Money';
import Attendance from '../../schemas/attendanceSchema';
import DateFormatting from '../../utils/DateFormatting';
import dayjs from 'dayjs';
import config from '../../../config';

export default new BaseCommand(
  {
    name: 'givemoney',
    description: '출석체크를 합니다.',
    aliases: ['돈받기', 'moneyget', 'ehswnj', '돈줘'],
  },
  async (client, message, args) => {
    const attendances = await Attendance.findOne({ user_id: message.author.id, date: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) } });
    if (!attendances) {
      let embed = new Embed(client, 'info')
        .setTitle('⭕ 출석 가능')
        .setDescription(`아직 오늘 출석하지 않았네요! [여기](${config.web.baseurl}/calendar)를 들어가서 출석을 해주세요!`)
      return message.reply({ embeds: [embed] });
    }
    else {
      let embed = new Embed(client, 'error')
        .setTitle('❌ 에러 발생')
        .setDescription(`이미 오늘은 출석을 하셨어요 ${DateFormatting._format(dayjs(dayjs().add(1, "day").toDate()).set('hour', 0).set('minute', 0).toDate(), 'R')}에 다시 와주세요!`)
        .addFields([
          {
            name: `하트인증`,
            value: `돈을 더 얻고 싶으시다면 '/하트인증'으로 돈을 더 얻으실 수 있습니다!`,
            inline: true
          }
        ]);
      return message.reply({ embeds: [embed] });
    }
  },
  {
    // @ts-ignore
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
      if (!attendances) {
        let embed = new Embed(client, 'default')
          .setTitle('⭕ 출석 가능')
          .setDescription(`아직 오늘 출석하지 않았네요! [여기](${config.web.baseurl}/calendar)를 들어가서 출석을 해주세요!`)
        return interaction.editReply({ embeds: [embed] });
      }
      else {
        let embed = new Embed(client, 'error')
          .setTitle('❌ 에러 발생')
          .setDescription(`이미 오늘은 출석을 하셨어요 ${DateFormatting._format(dayjs(dayjs().add(1, "day").toDate()).set('hour', 0).set('minute', 0).toDate(), 'R')}에 다시 와주세요!`)
          .addFields([
            {
              name: `하트인증`,
              value: `돈을 더 얻고 싶으시다면 '/하트인증'으로 돈을 더 얻으실 수 있습니다!`,
              inline: true
            }
          ]);
        return interaction.editReply({ embeds: [embed] });
      }
    },
  }
);
