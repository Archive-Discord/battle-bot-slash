import { SlashCommandBuilder } from '@discordjs/builders';
import { PermissionsBitField, ChannelType } from 'discord.js';
import { BaseCommand } from '../../structures/Command';
import Schema from '../../schemas/musicSchema';
import Embed from '../../utils/Embed';

export default new BaseCommand(
  {
    name: '뮤직',
    description: '',
    aliases: ['뮤직', 'music'],
  },
  async (client, message, args) => {
    message.reply('빗금으로 이전되었습니다.');
  },
  {
    data: new SlashCommandBuilder()
      .setName('뮤직')
      .setDescription('설치형 뮤직 시스템을 설정합니다.'),
    async execute(client, interaction) {
      if (!interaction.member?.permissions.has([PermissionsBitField.Flags.Administrator]))
        return interaction.reply({
          embeds: [
            new Embed(client, 'error')
              .setTitle('권한이 없습니다.')
              .setDescription(`서버에 관리자 권한이 부족하여 사용이 불가능합니다.`)
              .setColor('#2f3136'),
          ],
        });
      const find = await Schema.findOne({ guild_id: interaction.guild.id });
      if (find) {
        const embed1 = new Embed(client, 'error')
          .setTitle('❌ 에러 발생')
          .setDescription(
            `이미 <#${find.channel_id}>로 음악기능이 설정되어있는거 같습니다.\n채널을 삭제하셨거나 다시 설정을 원하시면 \`!뮤직설정헤제\` 입력 후 다시 시도해주세요.`,
          )
          .setColor('#2f3136');
        return interaction.reply({ embeds: [embed1] });
      }
      const set = await interaction.guild.channels
        .create({ name: 'battle-bot-music', type: ChannelType.GuildText })
        .then((result) => {
          const ss = new Embed(client, 'default')
            .setTitle(`📃 재생목록 __**${interaction.guild.name}**__`)
            .setThumbnail(interaction.guild.iconURL())
            .setDescription(`**현재 대기열에 __0곡__이 있습니다.**`)
            .setColor('#2f3136');
          const channel = interaction.guild.channels.cache.get(result.id);

          if (!channel)
            return interaction.reply({
              content: '이런 채널 없는거같에요. 다시한번 시도해주세요.',
              ephemeral: true,
            });
          if (!channel.isTextBased())
            return interaction.reply({
              content: '카테고리를 설정할수 없어요',
              ephemeral: true,
            });
          channel.send({ embeds: [ss] }).then((ss) => {
            const gg = new Embed(client, 'warn')
              .setAuthor({
                name: '재생 중인 노래',
                iconURL:
                  'https://images-ext-1.discordapp.net/external/n83quR20ZzWm4y8bO4lnFUWouP0c4rtao8TbXckuvTc/%3Fv%3D1/https/cdn.discordapp.com/emojis/667750713698549781.gif',
              })
              .setTitle('재생중인 노래가 없어요')
              .setFooter({
                text: client.user?.username!,
                iconURL: client.user?.displayAvatarURL()!,
              })
              .setDescription(
                '❌ **노래가 재생 중이지 않아요!\n해당 채널에 노래 제목을 입력해주세요!**\n[대시보드](https://battlebot.kr/)|[서포트 서버](https://discord.gg/WtGq7D7BZm)|[상태](https://battlebot.kr/status)',
              )
              .setColor('#2f3136')
              .setImage(
                'https://cdn.discordapp.com/attachments/901745892418256910/941301364095586354/46144c4d9e1cf2e6.png',
              );

            const channel = interaction.guild.channels.cache.get(result.id);

            if (!channel)
              return interaction.reply({
                content: '이런 채널 없는거같에요. 다시한번 시도해주세요.',
                ephemeral: true,
              });
            if (!channel.isTextBased())
              return interaction.reply({
                content: '카테고리를 설정할수 없어요',
                ephemeral: true,
              });
            channel.send({ embeds: [gg] }).then((tt) => {
              const newData = new Schema({
                guild_id: interaction.guild.id,
                channel_id: result.id,
                messageid_list: ss.id,
                messageid_banner: tt.id,
              });
              newData.save();
            });
          });
          interaction.reply({
            content: `<#${result.id}> 노래기능 설정이 완료되었습니다.`,
          });
        });
    },
  },
);
