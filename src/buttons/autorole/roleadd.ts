import { DiscordAPIError, ButtonBuilder, Role } from 'discord.js';
import AutoRole from '../../schemas/AutoRoleSchema';
import Blacklist from '../../schemas/blacklistSchemas';
import { ButtonInteraction } from '../../structures/Command';
import Embed from '../../utils/Embed';

export default new ButtonInteraction(
  {
    name: 'autorole.add',
  },
  async (client, interaction) => {
    await interaction.deferReply({ ephemeral: true });
    const role_id = interaction.customId.split('_')[1];
    const ErrEmbed = new Embed(client, 'error');
    const SuccessEmbed = new Embed(client, 'success').setColor('#2f3136');
    const autoroleDB = await AutoRole.findOne({
      guild_id: interaction.guild?.id,
      message_id: interaction.message.id,
    });
    if (!autoroleDB) {
      ErrEmbed.setTitle('이 서버에 자동역할 기능을 설정한 기록이 없어요!');
      return interaction.editReply({ embeds: [ErrEmbed] });
    } else {
      const role = interaction.guild?.roles.cache.get(role_id) as Role;
      if (!role) {
        ErrEmbed.setTitle('역할을 찾을 수 없어요!');
        return interaction.editReply({ embeds: [ErrEmbed] });
      }
      const user = interaction.guild?.members.cache.get(interaction.user.id);
      if (autoroleDB.isKeep) {
        await user?.roles
          .add(role)
          .then((role) => {
            SuccessEmbed.setTitle(`역할을 성공적으로 지급했어요!`);
            return interaction.editReply({ embeds: [SuccessEmbed] });
          })
          .catch((e: DiscordAPIError) => {
            if (e.code === 50013) {
              ErrEmbed.setTitle('이 역할을 지급할 권한이 부족해요');
              return interaction.editReply({ embeds: [ErrEmbed] });
            } else {
              ErrEmbed.setTitle('역할을 지급에 오류가 발생했어요! ');
              return interaction.editReply({ embeds: [ErrEmbed] });
            }
          });
      } else {
        const roles: string[] = [];
        interaction.message.components?.forEach((x) => {
          x.components.forEach((x2: any) => {
            const role_id = x2.customId.split('_')[1];
            roles.push(role_id);
          });
        });
        await user?.roles
          .remove(roles)
          .then(async (d) => {
            await user?.roles
              .add(role)
              .then(() => {
                SuccessEmbed.setTitle(`${role.name}을 성공적으로 지급했어요!`);
                return interaction.editReply({ embeds: [SuccessEmbed] });
              })
              .catch((e) => {
                if (e.code === 50013) {
                  ErrEmbed.setTitle('이 역할을 지급할 권한이 부족해요');
                  return interaction.editReply({ embeds: [ErrEmbed] });
                } else {
                  ErrEmbed.setTitle('역할을 지급에 오류가 발생했어요! ');
                  return interaction.editReply({ embeds: [ErrEmbed] });
                }
              });
          })
          .catch((e: DiscordAPIError) => {
            if (e.code === 50013) {
              ErrEmbed.setTitle('역할들을 삭제할 권한이 부족해요');
              return interaction.editReply({ embeds: [ErrEmbed] });
            } else {
              ErrEmbed.setTitle('역할을 지급에 오류가 발생했어요! ');
              return interaction.editReply({ embeds: [ErrEmbed] });
            }
          });
      }
    }
  },
);
