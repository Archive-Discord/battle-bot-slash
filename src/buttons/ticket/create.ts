import Ticket from '../../schemas/ticketSchema';
import TicketSetting from '../../schemas/ticketSettingSchema';
import { ButtonInteraction } from '../../structures/Command';
import randomstring from 'randomstring';
import Embed from '../../utils/Embed';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType } from 'discord.js';
import { LogFlags, sendLoggers } from '../../utils/Utils';
export default new ButtonInteraction(
  {
    name: 'ticket.create',
  },
  async (client, interaction) => {
    await interaction.deferReply({ ephemeral: true });
    const ticketSetting = await TicketSetting.findOne({
      guildId: interaction.guild?.id,
    });
    const guildtickets = await Ticket.find({ guildId: interaction.guild?.id });
    if (!ticketSetting) {
      return interaction.editReply('이 서버는 티켓 생성 기능을 사용 중이지 않습니다');
    } else {
      const ticketId = randomstring.generate({ length: 25 });
      const count = guildtickets.length + 1;
      const categori = interaction.guild?.channels.cache.get(ticketSetting.categories!);
      await interaction.guild?.channels
        .create({
          type: ChannelType.GuildText,
          name: `ticket-${count}-${interaction.user.globalName}`,
          permissionOverwrites: [
            {
              id: interaction.guild?.roles.everyone,
              deny: ['ViewChannel'],
            },
            {
              id: interaction.user.id,
              allow: ['ViewChannel', 'ReadMessageHistory', 'AttachFiles', 'SendMessages'],
            },
          ],
          parent: categori ? categori.id : undefined,
          topic: `<@!${interaction.user.id}> 님의 티켓`,
        })
        .then((channel) => {
          channel.lockPermissions().catch((err) => {
            return console.error(err);
          });
          const ticket = new Ticket();
          ticket.status = 'open';
          ticket.guildId = interaction.guild?.id as string;
          ticket.userId = interaction.user.id;
          ticket.ticketId = ticketId;
          ticket.channelId = channel.id;
          ticket.save((err: any) => {
            if (err) return interaction.editReply('티켓을 생성하는 도중 오류가 발생했어요');
          });
          const embed = new Embed(client, 'success')
            .setTitle('티켓')
            .setDescription(
              `<@${interaction.user.id}> 님의 티켓 \n 티켓 종료를 원하시면 🔒 닫기 버튼을 눌러주세요`,
            )
            .setColor('#2f3136');
          const buttonSave = new ButtonBuilder()
            .setLabel('저장')
            .setStyle(ButtonStyle.Success)
            .setEmoji('💾')
            .setCustomId('ticket:save');
          const buttonDelete = new ButtonBuilder()
            .setLabel('삭제')
            .setStyle(ButtonStyle.Danger)
            .setEmoji('🗑️')
            .setCustomId('ticket:delete');
          const buttonClose = new ButtonBuilder()
            .setLabel('닫기')
            .setStyle(ButtonStyle.Primary)
            .setEmoji('🔒')
            .setCustomId('ticket:close');
          const componets = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(buttonSave)
            .addComponents(buttonClose)
            .addComponents(buttonDelete);
          channel.send({
            content: `<@${interaction.user.id}>`,
            embeds: [embed],
            components: [componets],
          });
          interaction.editReply(`티켓이 생성되었습니다 <#${channel.id}>`);

          sendLoggers(client, interaction.guild!,
            new Embed(client, "success")
              .setTitle('티켓 생성')
              .setAuthor({
                name: interaction.user.username,
                iconURL: interaction.user.displayAvatarURL(),
              }).addFields({
                name: '유저',
                value: `<@${interaction.user.id}>` + '(`' + interaction.user.id + '`)',
              }),
            LogFlags.TICKET_CREATE);
        });
    }
  },
);
