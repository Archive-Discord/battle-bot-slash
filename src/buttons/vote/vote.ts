import {
  DiscordAPIError,
  ButtonBuilder,
  Role,
  EmbedBuilder,
  TextChannel
} from 'discord.js'
import { VoteItem } from '../../../typings'
import AutoRole from '../../schemas/AutoRoleSchema'
import Blacklist from '../../schemas/blacklistSchemas'
import Votes from '../../schemas/VoteSchema'
import { ButtonInteraction } from '../../structures/Command'
import Embed from '../../utils/Embed'
const VoteCooldown = new Map()

export default new ButtonInteraction(
  {
    name: 'vote.select'
  },
  async (client, interaction) => {
    const ErrEmbed = new Embed(client, 'error').setColor('#2f3136')
    if (!interaction.guild) {
      ErrEmbed.setTitle('서버에서만 투표할 수 있어요!')
      return interaction.editReply({ embeds: [ErrEmbed] })
    }
    await interaction.deferReply({ ephemeral: true })
    const vote_id = interaction.customId.split('_')[1]
    const SuccessEmbed = new Embed(client, 'success').setColor('#2f3136')
    const VoteDB = await Votes.findOne({
      guild_id: interaction.guild?.id,
      message_id: interaction.message.id
    })
    if (!VoteDB) {
      ErrEmbed.setTitle('찾을 수 없는 투표이거나 이미 종료된 투표에요!')
      return interaction.editReply({ embeds: [ErrEmbed] })
    } else {
      if (VoteDB.status === 'close') {
        ErrEmbed.setTitle('이미 종료된 투표에요!')
        return interaction.editReply({ embeds: [ErrEmbed] })
      }
      if (
        !VoteCooldown.has(
          `vote_${interaction.guild.id}_${interaction.user.id}_${interaction.message.id}`
        )
      )
        VoteCooldown.set(
          `vote_${interaction.guild.id}_${interaction.user.id}_${interaction.message.id}`,
          Date.now() - 6000
        )
      const cooldown = VoteCooldown.get(
        `vote_${interaction.guild.id}_${interaction.user.id}_${interaction.message.id}`
      )
      if (cooldown && Date.now() - cooldown > 5000) {
        const channel = interaction.channel as TextChannel
        let message = channel.messages.cache.get(VoteDB.message_id)
        if (!message) message = await channel.messages.fetch(VoteDB.message_id)
        if (!message) return
        const isVoted: VoteItem | undefined = VoteDB.vote_items.find((item) =>
          item.voted.includes(interaction.user.id)
        )
        if (isVoted) {
          await Votes.updateOne(
            {
              guild_id: interaction.guild?.id,
              message_id: interaction.message.id,
              'vote_items.item_id': isVoted.item_id
            },
            {
              $inc: { 'vote_items.$.vote': -1 },
              $pull: { 'vote_items.$.voted': interaction.user.id }
            }
          )
        }
        await Votes.updateOne(
          {
            guild_id: interaction.guild?.id,
            message_id: interaction.message.id,
            'vote_items.item_id': vote_id
          },
          {
            $inc: { 'vote_items.$.vote': 1 },
            $push: { 'vote_items.$.voted': interaction.user.id }
          }
        )
        const newVoteItem = await Votes.findOne({
          guild_id: interaction.guild.id,
          message_id: interaction.message.id
        })
        if (!newVoteItem) {
          ErrEmbed.setTitle('투표 업데이트중 오류가 발생했어요!')
          return interaction.editReply({ embeds: [ErrEmbed] })
        }
        VoteCooldown.set(
          `vote_${interaction.guild.id}_${interaction.user.id}_${interaction.message.id}`,
          Date.now()
        )
        const voteEmbed = VoteEmbed(
          newVoteItem.vote_items,
          interaction.message.embeds[0].description as string
        )
        SuccessEmbed.setTitle('성공적으로 투표에 참가했어요!')
        SuccessEmbed.setColor('#2f3136')
        interaction.editReply({ embeds: [SuccessEmbed] })
        return message.edit({ embeds: [voteEmbed] })
      } else {
        ErrEmbed.setTitle(
          '너무 빠른속도로 투표에 참가중이에요... 잠시후에 다시 시도해주세요!'
        )
        return interaction.editReply({ embeds: [ErrEmbed] })
      }
    }
  }
)

const VoteEmbed = (items: VoteItem[], title: string) => {
  const embed = new EmbedBuilder().setColor('#2f3136')
  embed.setTitle('🗳 투표')
  embed.setDescription(title)
  items.forEach((item, index) => {
    embed.addFields({
      name: `${item.item_name}`,
      value: `\`${item.vote}\`표`,
      inline: true
    })
  })
  return embed
}
