import config from '../../../config';
import { Collection, Message } from 'discord.js';
import Ticket from '../../schemas/ticketSchema';
import { ButtonInteraction } from '../../structures/Command';
import Embed from '../../utils/Embed';
import discordTranscripts, { ExportReturnType } from 'discord-html-transcripts';

export default new ButtonInteraction(
  {
    name: 'ticket.save',
  },
  async (client, interaction) => {
    await interaction.deferReply({ ephemeral: true });
    if (!interaction.channel) return;
    const ticket = await Ticket.findOne({
      guildId: interaction.guild?.id,
      channelId: interaction.channel?.id,
    });
    const ErrorEmbed = new Embed(client, 'error')
      .setTitle('찾을 수 없는 티켓 정보입니다')
      .setColor('#2f3136');
    if (!ticket) return await interaction.editReply({ embeds: [ErrorEmbed] });

    const SaveingEmbed = new Embed(client, 'info')
      .setTitle('채팅 기록을 저장하는 중입니다')
      .setColor('#2f3136');
    await interaction.editReply({ embeds: [SaveingEmbed] });

    const message = await discordTranscripts.createTranscript(interaction.channel, {
      limit: -1,
      returnType: ExportReturnType.String,
      saveImages: false,
      footerText: "{number}개의 메시지가 저장되었습니다.",
      poweredBy: false
    });
    await Ticket.updateOne(
      { guildId: interaction.guild?.id, channelId: interaction.channel?.id },
      { $set: { messagesHTML: message } },
    );

    const successembed = new Embed(client, 'success')
      .setTitle('티켓이 저장되었습니다')
      .setDescription(
        `[여기](${config.web?.baseurl}/dashboard/${interaction.guild?.id}/ticket/${ticket.ticketId})에서 확인할 수 있습니다`,
      )
      .setColor('#2f3136');

    await interaction.editReply({ embeds: [successembed] });
  },
);
