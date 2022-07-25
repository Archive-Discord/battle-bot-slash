import {
  CommandInteraction,
  MessageActionRow,
  MessageButton,
  MessageEmbed
} from 'discord.js'

const musicbuttonrow = async (
  interaction: CommandInteraction,
  embed: MessageEmbed
) => {
  const row = new MessageActionRow().addComponents(buttonList)
  interaction.editReply({ embeds: [embed], components: [row], content: ' ' })
}

const buttonList: MessageButton[] = [
  new MessageButton()
    .setCustomId('music.back')
    .setStyle('primary')
    .setLabel('Back')
    .setEmoji('⬅️'),
  new MessageButton()
    .setCustomId('music.repeat')
    .setStyle('primary')
    .setLabel('Repeat')
    .setEmoji('🔁'),
  new MessageButton()
    .setCustomId('music.shuffle')
    .setStyle('primary')
    .setLabel('Shuffle')
    .setEmoji('🔀'),
  new MessageButton()
    .setCustomId('music.pause')
    .setStyle('primary')
    .setLabel('Pause')
    .setEmoji('⏯️'),
  new MessageButton()
    .setCustomId('music.next')
    .setStyle('primary')
    .setLabel('Next')
    .setEmoji('➡️')
]

export { buttonList }

export default musicbuttonrow
