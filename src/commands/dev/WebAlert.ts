import { BaseCommand } from '../../structures/Command'
import alertSender from '../../utils/WebAlertSender'
import {
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  SlashCommandBuilder,
  ModalActionRowComponentBuilder,
  InteractionType
} from 'discord.js'

export default new BaseCommand(
  {
    name: 'webalert',
    description: '웹 알림을 보냅니다',
    aliases: ['웹알림', '알림추가']
  },
  async (client, message, args) => {
    // @ts-ignore
    if (!client.dokdo.owners.includes(message.author.id))
      return message.reply(
        `해당 명령어는 ${client.user?.username}의 주인이 사용할 수 있는 명령어입니다.`
      )
  },
  {
    data: new SlashCommandBuilder()
      .setName('웹알림')
      .setDescription('웹에 알림을 보냅니다'),
    options: {
      name: '웹알림',
      isSlash: true
    },
    async execute(client, interaction) {
      // @ts-ignore
      if (!client.dokdo.owners.includes(interaction.user.id))
        return interaction.reply(
          `해당 명령어는 ${client.user?.username}의 주인이 사용할 수 있는 명령어입니다.`
        )
      const title = new TextInputBuilder()
        .setCustomId('modal.webalert.title')
        .setLabel('제목')
        .setStyle(TextInputStyle.Short)
        .setMinLength(1)
        .setMaxLength(10)
        .setPlaceholder('알림의 제목을 입력해주세요.')
        .setRequired(true)
      const description = new TextInputBuilder()
        .setCustomId('modal.webalert.description')
        .setLabel('설명')
        .setStyle(TextInputStyle.Paragraph)
        .setPlaceholder('알림의 설명을 입력해주세요.')
        .setRequired(true)
      const linkTitle = new TextInputBuilder()
        .setCustomId('modal.webalert.linktitle')
        .setLabel('링크 제목')
        .setStyle(TextInputStyle.Short)
        .setMinLength(1)
        .setMaxLength(10)
        .setPlaceholder('알림의 링크 제목을 입력해주세요.')
        .setRequired(false)
      const link = new TextInputBuilder()
        .setCustomId('modal.webalert.link')
        .setLabel('링크')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('알림에 링크를 넣을경우 필수로 입력해주세요.')
        .setRequired(false)
      const user = new TextInputBuilder()
        .setCustomId('modal.webalert.user')
        .setLabel('유저')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder(
          '알림을 보낼 유저 아이디를 입력해주세요. (빈곳으로 둘 경우 모든 유저에게 발송됩니다)'
        )
        .setRequired(false)
      const modal = new ModalBuilder()
        .setCustomId('modal.webalert')
        .setTitle('배틀이 웹 알림')

      const row1 =
        new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
          title
        )
      const row2 =
        new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
          description
        )
      const row3 =
        new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
          linkTitle
        )
      const row4 =
        new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
          link
        )
      const row5 =
        new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
          user
        )

      modal.addComponents([row1, row2, row3, row4, row5])
      await interaction.showModal(modal)
      client.on('interactionCreate', async (modal) => {
        if (modal.type !== InteractionType.ModalSubmit) return
        if (modal.customId === 'modal.webalert') {
          const webalertTitle = modal.fields.getTextInputValue(
            'modal.webalert.title'
          )
          const webalertDescription = modal.fields.getTextInputValue(
            'modal.webalert.description'
          )
          const webalertLinktitle = modal.fields.getTextInputValue(
            'modal.webalert.linktitle'
          )
          const webalertLink = modal.fields.getTextInputValue(
            'modal.webalert.link'
          )
          const webalertUser = modal.fields.getTextInputValue(
            'modal.webalert.user'
          )
          await modal.deferReply({ ephemeral: true })
          if (webalertLinktitle && !webalertLink) {
            modal.followUp({
              content:
                '링크를 넣을경우 링크 제목과 링크 향목을 필수로 입력해야합니다',
              ephemeral: true
            })
          }
          if (!webalertLinktitle && webalertLink) {
            modal.followUp({
              content:
                '링크를 넣을경우 링크 제목과 링크 향목을 필수로 입력해야합니다',
              ephemeral: true
            })
          }
          await alertSender(
            webalertTitle,
            webalertDescription,
            { url: webalertLink, value: webalertLinktitle },
            webalertUser
          )
            .then(() => {
              return modal.followUp({
                content: '성공적으로 알림을 추가했습니다',
                ephemeral: true
              })
            })
            .catch((e: any) => {
              return modal.followUp({ content: e.message, ephemeral: true })
            })
        }
      })
    }
  }
)
