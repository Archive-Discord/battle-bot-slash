import { userMention } from '@discordjs/builders'
import { MusicDB } from '../../../typings'
import { MusicTrackEvent } from '../../events/onReady'
import MusicSetting from '../../schemas/musicSchema'
import { ButtonInteraction } from '../../structures/Command'
import Embed from '../../utils/Embed'
export default new ButtonInteraction(
  {
    name: 'music.shuffle'
  },
  async (client, interaction) => {
    await interaction.deferReply({ ephemeral: true })
    const errembed = new Embed(client, 'error')
      .setColor('#2f3136')
    if (!interaction.guild) {
      errembed.setTitle('❌ 이 버튼은 서버에서만 사용이 가능해요!')
      return interaction.editReply({ embeds: [errembed] })
    }
    const user = interaction.guild?.members.cache.get(interaction.user.id)
    const channel = user?.voice.channel
    if (!channel) {
      errembed.setTitle('❌ 음성 채널에 먼저 입장해주세요!')
      return interaction.editReply({ embeds: [errembed] })
    }
    const guildQueue = client.player.getQueue(interaction.guild.id)
    if (!guildQueue) {
      errembed.setTitle('❌ 노래가 재생 중이지 않아요!')
      return interaction.editReply({ embeds: [errembed] })
    }
    if (guildQueue) {
      if (channel.id !== interaction.guild.me?.voice.channelId) {
        errembed.setTitle('❌ 이미 다른 음성 채널에서 재생 중입니다!')
        return interaction.editReply({ embeds: [errembed] })
      }
    }
    const musicDB = (await MusicSetting.findOne({
      guild_id: guildQueue.guild.id
    })) as MusicDB
    const sucessembed = new Embed(client, 'info')
      .setColor('#2f3136')
    await guildQueue.shuffle()
    MusicTrackEvent(client, guildQueue, musicDB)
    sucessembed.setDescription(
      `**${userMention(interaction.user.id)}님의 요청으로 노래를 섞었어요!**`
    )
    return interaction.editReply({ embeds: [sucessembed] })
  }
)
