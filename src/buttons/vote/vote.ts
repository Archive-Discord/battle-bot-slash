import { DiscordAPIError, MessageButton, Role, MessageEmbed, TextChannel } from 'discord.js'
import { VoteItem } from '../../../typings'
import AutoRole from '../../schemas/AutoRoleSchema'
import Blacklist from '../../schemas/blacklistSchemas'
import Votes from '../../schemas/VoteSchema'
import { ButtonInteraction } from '../../structures/Command'
import Embed from '../../utils/Embed'

export default new ButtonInteraction(
  {
    name: 'vote.select'
  },
  async (client, interaction) => {
    const ErrEmbed = new Embed(client, 'error')
    if(!interaction.guild) {
      ErrEmbed.setTitle('서버에서만 투표할 수 있어요!')
      return interaction.editReply({embeds: [ErrEmbed]})
    }
    await interaction.deferReply({ephemeral: true})
    const vote_id = interaction.customId.split("_")[1]
    const SuccessEmbed = new Embed(client, 'success')
    const VoteDB = await Votes.findOne({guild_id: interaction.guild?.id, message_id: interaction.message.id})
    if(!VoteDB) {
      ErrEmbed.setTitle('찾을 수 없는 투표이거나 이미 종료된 투표에요!')
      return interaction.editReply({embeds: [ErrEmbed]})
    } else {
      if(VoteDB.status === "close") {
        ErrEmbed.setTitle('이미 종료된 투표에요!')
        return interaction.editReply({embeds: [ErrEmbed]})
      }
      const channel = interaction.channel as TextChannel
      let message = channel.messages.cache.get(VoteDB.message_id)
      if(!message) message = await channel.messages.fetch(VoteDB.message_id)
      if(!message) return
      const isVoted: VoteItem | undefined = VoteDB.vote_items.find(item => item.voted.includes(interaction.user.id))
      if(isVoted) {
        await Votes.updateOne({guild_id: interaction.guild?.id, message_id: interaction.message.id, "vote_items.item_id": isVoted.item_id}, {$inc: {"vote_items.$.vote": -1}, $pull: {"vote_items.$.voted": interaction.user.id}})
      }
      await Votes.updateOne({guild_id: interaction.guild?.id, message_id: interaction.message.id, "vote_items.item_id": vote_id}, {$inc: {"vote_items.$.vote": 1}, $push: {"vote_items.$.voted": interaction.user.id}})
      const newVoteItem = await Votes.findOne({guild_id: interaction.guild.id, message_id: interaction.message.id})
      if(!newVoteItem) {
        ErrEmbed.setTitle('투표 업데이트중 오류가 발생했어요!')
        return interaction.editReply({embeds: [ErrEmbed]})
      }
      const voteEmbed = VoteEmbed(newVoteItem.vote_items, interaction.message.embeds[0].description as string)
      SuccessEmbed.setTitle("성공적으로 투표에 참가했어요!")
      interaction.editReply({embeds: [SuccessEmbed]})
      return message.edit({embeds: [voteEmbed]})
    }
  }
)

const VoteEmbed = (items: VoteItem[], title: string) => {
  const embed = new MessageEmbed().setColor('#2f3136')
  embed.setDescription(title)
  items.forEach((item, index) => {
    embed.addField(`${item.item_name}`, `\`${item.vote}\`표`, true)
  })
  return embed
}
