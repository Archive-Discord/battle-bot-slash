import { MessageCommand } from '../../structures/Command';
import { DiscordAPIError, User } from 'discord.js';
import Embed from '../../utils/Embed';
import Premium from '../../schemas/premiumSchemas';
import Logger from '../../utils/Logger';
const logger = new Logger('premium');

export default new MessageCommand(
  {
    name: 'addpremium',
    description: '서버에 프리미엄을 추가합니다',
    aliases: ['프리미엄추가'],
  },
  async (client, message, args) => {
    // @ts-ignore
    if (!client.dokdo.owners.includes(message.author.id)) return;

    let LoadingEmbed = new Embed(client, 'warn')
      .setColor('#2f3136')
      .setTitle('잠시만 기다려주십시요')
      .setDescription('해당 서버의 정보를 찾는 중이에요...');
    let msg = await message.reply({ embeds: [LoadingEmbed] });
    let guild = client.guilds.cache.get(args[0]);
    let ErrorEmbed = new Embed(client, 'error')
      .setTitle('오류!')
      .setDescription('해당 서버는 봇이 입장되어 있지 않습니다');
    if (!guild) return await msg.edit({ embeds: [ErrorEmbed] });
    let premiumDB = await Premium.findOne({ guild_id: guild.id });
    let date = new Date(args[1]);
    if (!premiumDB) {
      let premium = new Premium();
      premium.guild_id = guild.id;
      premium.nextpay_date = date;
      premium.save(async (err: any) => {
        if (err) {
          let ErrorEmbed = new Embed(client, 'error')
            .setTitle('오류!')
            .setDescription('데이터 저장중 오류가 발생했습니다');
          return await msg.edit({ embeds: [ErrorEmbed] });
        }
      });
      let successEmbed = new Embed(client, 'success')
        .setColor('#2f3136')
        .setTitle('프리미엄')
        .setDescription(
          `관리자 ${message.author.username}에 의하여 ${guild.name}서버의 프리미엄 만료일이 ${
            date.getFullYear() + '년 ' + (date.getMonth() + 1) + '월 ' + date.getDate() + '일'
          } 로 설정되었습니다`,
        );
      try {
        let owner = client.users.cache.get(guild.ownerId) as User;

        await owner.send({ embeds: [successEmbed] });
      } catch (e: any) {
        logger.error(e);
      }
      logger.info(
        `관리자 ${message.author.username}에 의하여 ${guild.name}서버의 프리미엄 만료일이 ${
          date.getFullYear() + '년 ' + (date.getMonth() + 1) + '월 ' + date.getDate() + '일'
        } 로 설정되었습니다`,
      );
      return await msg.edit({ embeds: [successEmbed] });
    } else {
      await Premium.updateOne({ guild_id: guild.id }, { $set: { nextpay_date: date } });
      let successEmbed = new Embed(client, 'success')
        .setColor('#2f3136')
        .setTitle('프리미엄')
        .setDescription(
          `관리자 ${message.author.username}에 의하여 ${guild.name}서버의 프리미엄 만료일이 ${
            date.getFullYear() + '년 ' + (date.getMonth() + 1) + '월 ' + date.getDate() + '일'
          } 로 설정되었습니다`,
        );
      try {
        let owner = client.users.cache.get(guild.ownerId) as User;
        await owner.send({ embeds: [successEmbed] });
      } catch (e) {
        // @ts-ignore
        logger.error(e);
      }
      logger.info(
        `관리자 ${message.author.username}에 의하여 ${guild.name}서버의 프리미엄 만료일이 ${
          date.getFullYear() + '년 ' + (date.getMonth() + 1) + '월 ' + date.getDate() + '일'
        } 로 설정되었습니다`,
      );
      return await msg.edit({ embeds: [successEmbed] });
    }
  },
);
