const { ButtonInteraction } = require('discord.js') // eslint-disable-line no-unused-vars
const { Blacklist } = require('../../schemas/blacklistSchemas')
const Embed = require('../../utils/Embed')

module.exports = {
  name: 'blacklist.accept',
  description: '블랙리스트 승인 반응',
  /**
   *
   * @param {import('../../structures/BotClient')} client
   * @param {ButtonInteraction} interaction
   */
  async execute(client, interaction) {
    await interaction.deferReply({ephemeral: true})
    if(!client.dokdo.owners.includes(interaction.user.id)) return interaction.editReply(`해당 명령어는 ${client.user.username}의 주인이 사용할 수 있는 명령어입니다.`)
    let blacklist = await Blacklist.findOne({message: interaction.message.id, status: 'pending'})
    if(!blacklist) return interaction.editReply({embeds: [new Embed(client, 'warn').setDescription('이미 처리가 완료된 블랙리스트입니다')]})
    await Blacklist.updateOne({message: interaction.message.id}, {$set: {status: 'blocked'}})
    return interaction.editReply({embeds: [new Embed(client, 'success').setDescription('성공적으로 승인이 완료되었습니다')]})
  },
}
