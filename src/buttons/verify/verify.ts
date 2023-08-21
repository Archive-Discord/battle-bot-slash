import { Guild, ButtonInteraction as ButtonInteractionType, ButtonBuilder, ButtonStyle, ActionRowBuilder } from 'discord.js';
import { ButtonInteraction } from '../../structures/Command';
import Embed from '../../utils/Embed';
import { anyid } from 'anyid';
import Verify from '../../schemas/verifySchema';
import config from '../../../config';
import { guildProfileLink } from '../../utils/convert';
import checkPremium from '../../utils/checkPremium';
import BotClient from '../../structures/BotClient';
import { verifyType } from '../../../typings';
import LoginState from '../../schemas/loginStateSchema';
import Logger from '../../utils/Logger';

const logger = new Logger("verify V2")

export default new ButtonInteraction(
  {
    name: 'verifyv2',
  },
  async (client, interaction) => {
    await interaction.deferReply({ ephemeral: true });
    const type: verifyType = interaction.customId.split(':')[1] as any;
    const role = interaction.customId.split(':')[2]
    const deleteRole = interaction.customId.split(':')[3]

    if (type === 'phone' || type === 'kakao' || type === 'email') {
      const isPremium = await checkPremium(client, interaction.guild as Guild);
      if (!isPremium) {
        return interaction.editReply('프리미엄 기한 만료로 인증 기능이 비활성화되었습니다 \n다른 인증 기능을 사용하시려면 인증 버튼을 다시 설정해 주세요');
      }
    }

    return await verify(client, interaction, type, role, deleteRole);
  },
);

export const verify = async (client: BotClient, interaction: ButtonInteractionType, type: verifyType, role: string, deleteRole?: string) => {
  const url = await verifyGenerator(client, type, interaction.guild?.id as string, interaction.user.id, role, deleteRole);

  const captchaGuildEmbed = new Embed(client, 'info').setColor('#2f3136')
    .setThumbnail(guildProfileLink(interaction.guild as Guild))
    .setTitle(`${interaction.guild?.name} 서버 인증`)
    .setDescription(
      `${interaction.guild?.name}서버의 인증을 진행하시려면 아래 버튼을 눌러주세요\n\n디스코드가 멈출경우 [여기](${config.web.baseurl}/verify?token=${url.token})를 눌러 진행해주세요`
    )
    .setURL(`https://discord.com/channels/${interaction.guild?.id}/${interaction.channel?.id}`);

  const verifyButton = new ButtonBuilder()
    .setStyle(ButtonStyle.Link)
    .setLabel('인증하기')
    .setURL(url.loginUri)
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

    return interaction.editReply({
      components: [moveRow],
      content: "DM으로 인증정보를 보내드렸습니다 DM을 확인해주세요"
    });
  } catch (e) {
    logger.error(e as any)
    if (e)
      return interaction.editReply(
        '서버 멤버가 보내는 다이렉트 메시지 허용하기가 꺼저있는지 확인해주세요',
      );
  }
}

/**
 * @description 인증 링크 생성기
 * @returns redirect url, login token
*/
export const verifyGenerator = async (client: BotClient, type: verifyType, guildId: string, userId: string, role: string, deleteRole?: string): Promise<{
  token: string
  loginUri: string
}> => {
  const token = anyid()
    .encode('Aa0')
    .bits(48 * 8)
    .random()
    .id();
  const state = new Date().getTime().toString(36);


  await Verify.create({
    guild_id: guildId,
    user_id: userId,
    status: 'pending',
    type: type,
    token: token,
    deleteRole: deleteRole === "undefined" || !deleteRole ? null : deleteRole,
    role: role,
    expires_in: new Date(Date.now() + 1000 * 60 * 5), // 5분
  });

  await LoginState.create({
    state: state,
    redirect_uri: `/verify?token=${token}`,
  });

  return {
    token,
    loginUri: `https://discord.com/api/oauth2/authorize?client_id=${client.user?.id}&redirect_uri=${config.web?.baseapi}/auth/discord/callback/verify&response_type=code&scope=identify%20email%20guilds%20guilds.join&prompt=none&state=${state}`
  }
}