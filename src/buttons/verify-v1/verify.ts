import { ActionRowBuilder, ButtonBuilder, ButtonStyle, /* Guild, GuildMember, Message */ } from 'discord.js';
import VerifySetting from '../../schemas/verifySetting';
import { ButtonInteraction } from '../../structures/Command';
import config from '../../../config';
// import { anyid } from 'anyid';
// import Verify from '../../schemas/verifySchema';
// import config from '../../../config';
// import { guildProfileLink } from '../../utils/convert';
// import mailSender from '../../utils/MailSender';
// import checkPremium from '../../utils/checkPremium';
// import User from '../../schemas/userSchema';
// import { verify as v2Verify } from '../verify/verify';

/**
 * @desceiption 배틀이 V1 - 인증 8월 15일까지만 지원
*/
export default new ButtonInteraction(
  {
    name: 'verify',
  },
  async (client, interaction) => {
    await interaction.deferReply({ ephemeral: true });
    const VerifySettingDB = await VerifySetting.findOne({
      guild_id: interaction.guild?.id,
    });

    const verifyButton = new ButtonBuilder()
      .setStyle(ButtonStyle.Primary)
      .setLabel('인증하기')
      .setEmoji('✅')
      .setCustomId(`verify:default:${VerifySettingDB?.role_id}:${VerifySettingDB?.del_role_id}`)

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(verifyButton);

    return await interaction.message.edit({ embeds: interaction.message.embeds, components: [row], content: `\`\`\`배틀이 대시보드 업데이트로 현제 설정하신 기능은 8월 15일까지만 지원됩니다.\n8월 15일까지 새로운 대시보드를 접속하여 다시 설정해 주시기 바랍니다.\`\`\`\`새로운 대시보드\` - ${config.web.baseurl}/dashboard/${interaction.guild?.id}`, });

    // if (!VerifySettingDB) return interaction.editReply('찾을 수 없는 서버 정보입니다');
    // if (VerifySettingDB.type === 'default' || VerifySettingDB.type === 'captcha' as any) {
    //   const role = VerifySettingDB.role_id;
    //   const deleteRole = VerifySettingDB.del_role_id;
    //   return await v2Verify(client, interaction, role, deleteRole, 'default');
    // } else if (VerifySettingDB.type === 'email') {
    //   const isPremium = await checkPremium(client, interaction.guild as Guild);
    //   if (!isPremium) {
    //     return interaction.editReply('프리미엄 기한 만료로 이메일 인증 기능이 비활성화되었습니다');
    //   }
    //   const role = VerifySettingDB.role_id;
    //   const deleteRole = VerifySettingDB.del_role_id;
    //   return await v2Verify(client, interaction, role, deleteRole, 'email');
    // } else if (VerifySettingDB.type === 'kakao') {
    //   const isPremium = await checkPremium(client, interaction.guild as Guild);
    //   if (!isPremium) {
    //     return interaction.editReply('프리미엄 기한 만료로 카카오 인증 기능이 비활성화되었습니다');
    //   }
    //   const UserDB = await User.findOne({ id: interaction.user.id });
    //   if (!UserDB || !UserDB.kakao_name) {
    //     const Verify = new Embed(client, 'warn')
    //       .setTitle('인증')
    //       .setDescription(
    //         `인증을 진행하기 위해 [여기](${config.web?.baseurl}/me)에서 카카오 아이디 연동을 진행해 주세요 \n 연동 후 다시 인증 버튼을 눌러주세요`,
    //       )
    //       .setColor('#2f3136');
    //     return interaction.editReply({ embeds: [Verify] });
    //   }
    //   const member = interaction.member as GuildMember;
    //   try {
    //     await member.roles.remove(VerifySettingDB.del_role_id);
    //   } catch (e) {
    //     console.log(e);
    //   }
    //   try {
    //     await member.roles.add(VerifySettingDB?.role_id as string);
    //   } catch (e) {
    //     const captchaError = new Embed(client, 'error')
    //       .setTitle('인증')
    //       .setDescription('인증완료 역할 지급중 오류가 발생했습니다')
    //       .setColor('#2f3136');
    //     if (e) return interaction.editReply({ embeds: [captchaError] });
    //   }
    //   const VerifySuccess = new Embed(client, 'success')
    //     .setTitle('인증')
    //     .setDescription(
    //       `${UserDB.kakao_name}(\`${UserDB.kakao_email}\`) 정보로 인증이 완료되었습니다`,
    //     )
    //     .setColor('#2f3136');
    //   return interaction.editReply({ embeds: [VerifySuccess] });
    // }
  },
);
