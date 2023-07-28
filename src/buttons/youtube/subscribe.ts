import { ButtonInteraction } from '../../structures/Command';
import Embed from '../../utils/Embed';
import config from '../../../config';
import UserDB from '../../schemas/userSchema';
import axios, { AxiosError } from 'axios';
import { YoutubeChannels } from '../../../typings';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Guild } from 'discord.js';
import LoginState from '../../schemas/loginStateSchema';
import { guildProfileLink } from '../../utils/convert';
import checkGuildPremium from '../../utils/checkPremium';
import Logger from '../../utils/Logger';

const logger = new Logger('Yotubue Subscribe')
export default new ButtonInteraction(
  {
    name: 'youtube.subscribe',
  },
  async (client, interaction) => {
    await interaction.deferReply({ ephemeral: true });
    if (!interaction.channel) return;
    if (!interaction.guild) return;
    if (!checkGuildPremium(client, interaction.guild as Guild))
      return interaction.editReply('프리미엄 기한 만료로 유튜브 구독 기능이 비활성화되었습니다');

    const lodingEmbed = new Embed(client, 'info').setColor('#2f3136');
    const errorEmbed = new Embed(client, 'error').setColor('#2f3136');
    const successEmbed = new Embed(client, 'success').setColor('#2f3136');
    lodingEmbed.setDescription('**유튜브에서 정보를 찾아보는 중이에요!**');
    await interaction.editReply({ embeds: [lodingEmbed] });
    const userdb = await UserDB.findOne({ id: interaction.user.id });

    if (!userdb || !userdb.google_accessToken) {
      const state = new Date().getTime().toString(36);
      await LoginState.create({
        state: state,
        redirect_uri: `/youtube`,
      });
      const link = `https://discord.com/api/oauth2/authorize?client_id=${client.user?.id}&redirect_uri=${config.web?.baseapi}/auth/discord/callback/verify&response_type=code&scope=identify%20email%20guilds%20guilds.join&prompt=none&state=${state}`
      const captchaGuildEmbed = new Embed(client, 'info').setColor('#2f3136')
        .setThumbnail(guildProfileLink(interaction.guild as Guild))
        .setTitle(`${interaction.guild?.name} 서버 구독 인증`)
        .setDescription(
          `${interaction.guild?.name}서버의 구독 인증을 진행하시려면 아래 버튼을 눌러 유튜브 계정을 연동해 주세요!\n\n디스코드가 멈출경우 [여기](${config.web.baseurl}/youtube)를 눌러 진행해주세요`
        )
        .setURL(`https://discord.com/channels/${interaction.guild?.id}/${interaction.channel?.id}`);

      const verifyButton = new ButtonBuilder()
        .setStyle(ButtonStyle.Link)
        .setLabel('연동하기')
        .setURL(link)
        .setEmoji('✅')

      const row = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(verifyButton)

      try {
        const moveMessage = await interaction.user.send({ embeds: [captchaGuildEmbed], components: [row] });

        const verifyMoveButton = new ButtonBuilder()
          .setStyle(ButtonStyle.Link)
          .setLabel('DM으로 이동하기')
          .setURL(`https://discord.com/channels/@me/${moveMessage.channel.id}/${moveMessage.id}`)
          .setEmoji('✅')

        const moveRow = new ActionRowBuilder<ButtonBuilder>()
          .addComponents(verifyMoveButton)

        lodingEmbed.setDescription('**DM으로 이동하여 유튜브 계정을 먼저 연동해 주세요!**')
        return interaction.editReply({
          components: [moveRow],
          embeds: [lodingEmbed]
        });
      } catch (e) {
        logger.error(e as any)
        if (e)
          return interaction.editReply(
            '서버 멤버가 보내는 다이렉트 메시지 허용하기가 꺼저있는지 확인해주세요',
          );
      }
      return await interaction.editReply({ embeds: [errorEmbed] });
    } else {
      const chnnel_id = 'UCE9Wv-adygeb6PYcqLeRqbA';
      axios
        .get(
          `https://www.googleapis.com/youtube/v3/subscriptions?part=snippet&mine=true&forChannelId=${chnnel_id}`,
          {
            headers: {
              authorization: 'Bearer ' + userdb.google_accessToken,
            },
          },
        )
        .then(async (data) => {
          const youtubeData: YoutubeChannels = data.data;
          if (youtubeData.pageInfo.totalResults === 0) {
            const button1 = new ButtonBuilder()
              .setCustomId('youtube.subscribe.yes')
              .setLabel('네')
              .setStyle(ButtonStyle.Primary);
            const button2 = new ButtonBuilder()
              .setCustomId('youtube.subscribe.no')
              .setLabel('아니요')
              .setStyle(ButtonStyle.Danger);
            const row = new ActionRowBuilder<ButtonBuilder>().addComponents([button1, button2]);
            errorEmbed.setDescription(
              `**구독이 되어있지 않은 거 같아요!** \n 직접 구독해 드릴까요?`,
            );
            await interaction.editReply({
              embeds: [errorEmbed],
              components: [row],
            });
            const collector = interaction.channel?.createMessageComponentCollector({
              time: 10000,
            });
            collector?.on('collect', async (i) => {
              if (i.user.id !== interaction.user.id) return;
              if (i.customId === 'youtube.subscribe.yes') {
                await axios
                  .post(
                    `https://www.googleapis.com/youtube/v3/subscriptions?part=snippet`,
                    {
                      snippet: {
                        resourceId: {
                          channelId: chnnel_id,
                        },
                      },
                    },
                    {
                      headers: {
                        Authorization: 'Bearer ' + userdb?.google_accessToken,
                        redirect: 'follow',
                      },
                    },
                  )
                  .then(async (data) => {
                    console.log(data);
                    successEmbed.setTitle('**성공적으로 구독되었어요!**');
                    return interaction.editReply({
                      embeds: [successEmbed],
                      components: [],
                    });
                  })
                  .catch((err) => {
                    successEmbed.setTitle('**구독하기 중 오류가 발생했어요! 다시 시도해 주세요!**');
                    return interaction.editReply({
                      embeds: [successEmbed],
                      components: [],
                    });
                  });
              } else if (i.customId === 'youtube.subscribe.no') {
                errorEmbed.setDescription(`**구독하기가 취소되었습니다!**`);
                interaction.editReply({ embeds: [errorEmbed], components: [] });
              } else {
                return;
              }
            });
            collector?.on('end', (collected) => {
              if (collected.size == 1) return;
              interaction.editReply({
                embeds: [errorEmbed],
                components: [
                  new ActionRowBuilder<ButtonBuilder>().addComponents(
                    new ButtonBuilder()
                      .setCustomId('accept')
                      .setLabel('시간 초과. 다시 시도해주세요...')
                      .setStyle(ButtonStyle.Secondary)
                      .setEmoji('⛔')
                      .setDisabled(true),
                  ),
                ],
              });
            });
          } else {
            successEmbed.setTitle('**구독 인증이 완료되었어요!**');
            return interaction.editReply({
              embeds: [successEmbed],
              components: [],
            });
          }
        })
        .catch((e: AxiosError) => {
          if (e.response?.status === 401) {
            errorEmbed.setDescription(
              `**유튜브 인증이 만료된 거 같아요! \n [여기](${config.web.baseapi}/auth/google)에서 로그인후 다시 진행해주세요!**`,
            );
            return interaction.editReply({ embeds: [errorEmbed] });
          }
        });
    }
  },
);
