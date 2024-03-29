import Ticket from '../../schemas/ticketSchema';
import { ButtonInteraction } from '../../structures/Command';
import Embed from '../../utils/Embed';
import {
  GuildChannel,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  GuildMember,
} from 'discord.js';
import { LogFlags, sendLoggers } from '../../utils/Utils';
export default new ButtonInteraction(
  {
    name: 'ticket.close',
  },
  async (client, interaction) => {
    if (!interaction.inCachedGuild()) return;

    await interaction.deferReply({ ephemeral: true });
    const replyTicket = new Embed(client, 'info')
      .setDescription(`5초뒤에 티켓이 종료됩니다!,  <@!${interaction.user.id}>`)
      .setColor('#2f3136');
    await interaction.editReply({ embeds: [replyTicket] });
    const ticketDB = await Ticket.findOne({
      guildId: interaction.guild?.id,
      channelId: interaction.channel?.id,
      status: 'open',
    });
    if (!ticketDB)
      return await interaction.channel?.send({
        content: '이미 닫힌 티켓이거나 티켓 정보를 찾을 수 없습니다',
      });
    setTimeout(async () => {
      await Ticket.updateOne(
        {
          guildId: interaction.guild?.id,
          channelId: interaction.channel?.id,
          status: 'open',
        },
        { $set: { status: 'close' } },
      );
      const buttonSave = new ButtonBuilder()
        .setLabel('저장')
        .setStyle(ButtonStyle.Success)
        .setEmoji('💾')
        .setCustomId('save');
      const buttonDelete = new ButtonBuilder()
        .setLabel('삭제')
        .setStyle(ButtonStyle.Danger)
        .setEmoji('🗑')
        .setCustomId('delete');
      const componets = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(buttonSave)
        .addComponents(buttonDelete);
      const replyCloseTicket = new Embed(client, 'info')
        .setDescription(`티켓이 종료되었습니다!, <@!${interaction.user.id}>`)
        .setColor('#2f3136');
      interaction.channelId;
      const channel = interaction.guild?.channels.cache.get(
        interaction.channel?.id as string,
      ) as GuildChannel;
      await channel.permissionOverwrites.edit(
        interaction.guild.members.cache.get(ticketDB.userId!) as GuildMember,
        {
          SendMessages: false,
          ViewChannel: false,
        },
      );
      channel.setName(`closed-ticket-${ticketDB.ticketId?.slice(0, 5)}`);
      interaction.channel?.send({
        embeds: [replyCloseTicket],
        components: [componets],
      });

      const targetUser = interaction.guild?.members.cache.get(ticketDB.userId!) as GuildMember;
      sendLoggers(client, interaction.guild!,
        new Embed(client, "error")
          .setTitle('티켓 종료')
          .setAuthor({
            name: targetUser.user.username,
            iconURL: targetUser.user.displayAvatarURL(),
          }).addFields({
            name: '유저',
            value: `<@${targetUser.user.id}>` + '(`' + targetUser.user.id + '`)',
          }),
        LogFlags.TICKET_DELETE);

      return interaction.editReply({
        embeds: [replyCloseTicket],
        components: [componets],
      });
    }, 5000);
  },
);
