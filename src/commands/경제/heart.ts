import { BaseCommand } from '../../structures/Command';
import Embed from '../../utils/Embed';
import Discord, { ButtonBuilder, ButtonStyle } from 'discord.js';
import Schema from '../../schemas/Money';
import axios from 'axios';
import config from '../../../config';
import DateFormatting from '../../utils/DateFormatting';
import HeartSchema from '../../schemas/HeartCheck';

export default new BaseCommand(
  {
    name: '하트인증',
    description: '한디리 하트를 인증합니다',
    aliases: ['하트인증', 'ㅎㅌㅇㅈ', 'heart', 'gkxmdlswmd', 'cncjs'],
  },
  async (client, message, args) => {
    const money = await Schema.findOne({ userid: message.author.id });
    if (!money) {
      let embed = new Embed(client, 'default')
        .setTitle(`❌ 에러 발생`)
        .setDescription(message.author.toString() + '님의 정보가 확인되지 않습니다.\n먼저 `!돈받기`를 입력해 정보를 알려주세요!');
      return message.reply({ embeds: [embed] });
    }
    let embed = new Embed(client, 'default')
      .setTitle('하트인증')
      .setDescription('하트인증 진행할 플랫폼을 선택해주세요!');
    let m = await message.reply({
      embeds: [embed],
      components: [
        new Discord.ActionRowBuilder<ButtonBuilder>()
          .addComponents(
            new Discord.ButtonBuilder()
              .setLabel(`한디리 인증`)
              .setStyle(ButtonStyle.Primary)
              .setCustomId('heart.koreanlist'),
          )
      ],
    });
    const collector = m.createMessageComponentCollector({ time: 10000 });
    collector.on('collect', async (i) => {
      if (i.user.id != message.author.id) return;
      if (i.customId == 'heart.koreanlist') {
        axios
          .get(
            `https://koreanbots.dev/api/v2/bots/${client.user?.id}/vote?userID=${message.author.id}`,
            {
              headers: {
                Authorization: config.updateServer.koreanbots,
                'Content-Type': 'application/json',
              },
            },
          )
          .then(async (res) => {
            if (!res.data.data.voted) {
              embed = new Embed(client, 'info')
                .setTitle('한국 디스코드 리스트 봇 하트인증')
                .setDescription(
                  `한국 디스코드 리스트에 있는 배틀이 봇의 하트가 아직 눌려있지 않습니다.`,
                )
                .setTimestamp()
              let link = new Discord.ActionRowBuilder<ButtonBuilder>().addComponents(
                new Discord.ButtonBuilder()
                  .setURL(`https://koreanbots.dev/bots/${client.user?.id}/vote`)
                  .setLabel(`하트 누르기`)
                  .setStyle(ButtonStyle.Link),
              );
              i.reply({
                embeds: [embed],
                components: [link],
              });
              return m.edit({ components: [] });
            } else {
              const heartData = await HeartSchema.findOne({
                userid: message.author.id,
                platform: 'koreanlist',
              });
              if (!heartData) {
                await Schema.updateOne({ userid: message.author.id }, { $inc: { money: 20000 }, $set: { lastGuild: message.guild ? message.guild.id : money.lastGuild } });
                await HeartSchema.create({
                  userid: message.author.id,
                  platform: 'koreanlist',
                });
                embed = new Embed(client, 'default')
                  .setTitle('⭕ 하트 인증 성공')
                  .setDescription(
                    `${message.author.username}님의 한국 디스코드 리스트에 있는 배틀이 봇의 하트인증이 완료되었습니다.`,
                  )
                  .setTimestamp()
                i.reply({
                  embeds: [embed],
                });
                return m.edit({ components: [] });
              } else {
                embed = new Embed(client, 'warn')
                  .setTitle('❌ 하트 인증 실패')
                  .setDescription(
                    `${DateFormatting._format(
                      res.data.data.lastVote + 12 * 60 * 60 * 1000,
                      'R',
                    )} 뒤에 다시 인증해주세요!`,
                  )
                  .setTimestamp()
                i.reply({
                  embeds: [embed],
                });
                return m.edit({ components: [] });
              }
            }
          })
          .catch((e) => {
            if (e.response.status == 404) {
              embed = new Embed(client, 'error')
                .setTitle('❌ 에러 발생')
                .setDescription(`한국 디스코드 리스트에서 유저를 찾을 수 없어요!`)
                .setFooter({ text: `${message.author.tag}` })
                .setTimestamp()
              i.reply({
                embeds: [embed],
              });
              return m.edit({ components: [] });
            }
            embed = new Embed(client, 'error')
              .setTitle('❌ 에러 발생')
              .setDescription(`하트 인증중 오류가 발생했어요! ${e.message}`)
              .setFooter({ text: `${message.author.tag}` })
              .setTimestamp()
            i.reply({
              embeds: [embed],
            });
            return m.edit({ components: [] });
          });
      }
    });
    collector.on('end', (collected) => {
      if (collected.size == 1) return;
      m.edit({
        embeds: [embed],
        components: [
          new Discord.ActionRowBuilder<ButtonBuilder>()
            .addComponents(
              new Discord.ButtonBuilder()
                .setLabel(`한디리 인증`)
                .setStyle(ButtonStyle.Primary)
                .setCustomId('heart.koreanlist')
                .setDisabled(true),
            )
        ],
      });
    });
  },
);
