import Ticket from '../../schemas/ticketSchema';
import { ButtonInteraction } from '../../structures/Command';

/**
 * @desceiption 배틀이 V1 - 티켓 7월 30일까지만 지원
  */
export default new ButtonInteraction(
  {
    name: 'delete',
  },
  async (client, interaction) => {
    await Ticket.updateOne(
      { guildId: interaction.guild?.id, channelId: interaction.channel?.id },
      { $set: { status: 'close' } },
    );
    await interaction.reply({ content: '채널을 삭제합니다', ephemeral: true });
    await interaction.channel?.delete();
  },
);
