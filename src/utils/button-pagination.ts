import {
  ButtonBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonInteraction,
  ButtonStyle,
  ButtonComponent,
  ChatInputCommandInteraction,
} from 'discord.js';

const paginationEmbed = async (
  interaction: ChatInputCommandInteraction,
  pages: EmbedBuilder[],
  buttonList: ButtonBuilder[],
  timeout = 120000,
) => {
  if (!pages) throw new Error('Pages are not given.');
  if (!buttonList) throw new Error('Buttons are not given.');
  if (
    buttonList[0].data.style === ButtonStyle.Link ||
    buttonList[1].data.style === ButtonStyle.Link
  )
    throw new Error('링크 버튼은 사용이 불가능합니다');
  if (buttonList.length !== 2) throw new Error('2개의 버튼이 필요합니다');

  let page = 0;

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(buttonList);

  const curPage = await interaction.editReply({
    embeds: [pages[page].setFooter({ text: `페이지 ${page + 1} / ${pages.length}` })],
    components: [row],
  });

  const filter = (i: any) =>
    // @ts-ignore
    i.customId === buttonList[0].customId ||
    // @ts-ignore
    i.customId === buttonList[1].customId;

  const collector = await interaction.channel?.createMessageComponentCollector({
    filter,
    time: timeout,
  });

  collector?.on('collect', async (i) => {
    switch (i.customId) {
      // @ts-ignore
      case buttonList[0].customId:
        page = page > 0 ? --page : pages.length - 1;
        break;
      // @ts-ignore
      case buttonList[1].customId:
        page = page + 1 < pages.length ? ++page : 0;
        break;
      default:
        break;
    }
    await i.deferUpdate();
    await i.editReply({
      embeds: [pages[page].setFooter({ text: `페이지 ${page + 1} / ${pages.length}` })],
      components: [row],
    });
    collector.resetTimer();
  });

  collector?.on('end', (_, reason) => {
    if (reason !== 'messageDelete') {
      const disabledRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
        buttonList[0].setDisabled(true),
        buttonList[1].setDisabled(true),
      );
      interaction.editReply({
        embeds: [
          pages[page].setFooter({
            text: `페이지 ${page + 1} / ${pages.length}`,
          }),
        ],
        components: [disabledRow],
      });
    }
  });

  return curPage;
};

export default paginationEmbed;
