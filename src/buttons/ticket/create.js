const { CommandInteraction, MessageActionRow, MessageButton } = require('discord.js') // eslint-disable-line no-unused-vars
const { TicketSetting } = require('../../schemas/ticketSettingSchema')
const { Ticket } = require('../../schemas/ticketSchemas')
const randomstring = require('randomstring')
const Embed = require('../../utils/Embed')

module.exports = {
  name: 'create',
  description: '티켓 생성 반응', // cc src/utils/Button.js
  /**
   *
   * @param {import('../../structures/BotClient')} client
   * @param {CommandInteraction} interaction
   */
  async execute(client, interaction) {
    await interaction.deferReply({ephemeral: true})
    let ticketSetting = await TicketSetting.findOne({guildId: interaction.guild.id})
    let guildtickets = await Ticket.find({guildId: interaction.guild.id})
    
    if(!ticketSetting) {
      return interaction.editReply('이 서버는 티켓 생성 기능을 사용 중이지 않습니다')
    } else {
      let ticketId = randomstring.generate({length: 25})
      let count = guildtickets.length + 1
      let categori = interaction.guild.channels.cache.get(ticketSetting.categories)
      await interaction.guild.channels.create(`ticket-${count}-${interaction.user.discriminator}`, {
        type: 'GUILD_TEXT',
        permissionOverwrites: [{
          id: interaction.guild.roles.everyone,
          deny: ['VIEW_CHANNEL']
        },
        {
          id: interaction.user.id,
          allow: ['VIEW_CHANNEL', 'READ_MESSAGE_HISTORY', 'ATTACH_FILES', 'SEND_MESSAGES']
        }],
        parent: categori ? categori.id : null,
        topic: `<@!${interaction.user.id}> 님의 티켓`
      }).then((channel) => {
        let ticket = new Ticket()
        ticket.status = 'open'
        ticket.guildId = interaction.guild.id
        ticket.userId = interaction.user.id
        ticket.ticketId = ticketId
        ticket.channelId = channel.id
        ticket.save((err) => {
          if(err) return interaction.editReply('티켓을 생성하는 도중 오류가 발생했어요')
        })
        let embed = new Embed(client, 'success')
          .setTitle('티켓')
          .setDescription(`<@${interaction.user.id}> 님의 티켓 \n 티켓 종료를 원하시면 🔒 닫기 버튼을 눌러주세요`)
        let buttonSave = new MessageButton()
          .setLabel('저장')
          .setStyle('SUCCESS')
          .setEmoji('💾')
          .setCustomId('save')
        let buttonDelete = new MessageButton()
          .setLabel('삭제')
          .setStyle('DANGER')
          .setEmoji('🔒')
          .setCustomId('delete')
        let buttonClose = new MessageButton()
          .setLabel('닫기')
          .setStyle('PRIMARY')
          .setEmoji('❌')
          .setCustomId('close')
        let componets = new MessageActionRow()
          .addComponents(buttonSave)
          .addComponents(buttonClose)
          .addComponents(buttonDelete)
        channel.send({
          content: `<@${interaction.user.id}>`,
          embeds: [embed],
          components: [componets]
        })
        interaction.editReply(`티켓이 생성되었습니다 <#${channel.id}>`)
      })
    }
    
  },
}
