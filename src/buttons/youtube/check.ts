import { ButtonInteraction } from '../../structures/Command'
import Embed from '../../utils/Embed'
import config from '../../../config'
import UserDB from '../../schemas/userSchema'
import axios, { AxiosError } from 'axios'
import { YoutubeChannels } from '../../../typings'
import { MessageActionRow, MessageButton } from 'discord.js'

export default new ButtonInteraction(
  {
    name: 'youtube.check'
  },
  async (client, interaction) => {
    await interaction.deferReply({ ephemeral: true })
    if (!interaction.channel) return
    const lodingEmbed = new Embed(client, 'info')
    const errorEmbed = new Embed(client, 'error')
    const successEmbed = new Embed(client, 'success')
    lodingEmbed.setDescription('**유튜브에서 정보를 찾아보는 중이에요!**')
    await interaction.editReply({ embeds: [lodingEmbed] })
    const userdb = await UserDB.findOne({ id: interaction.user.id })
    if (!userdb || !userdb.google_accessToken) {
      errorEmbed.setDescription(
        `**[여기](${config.web?.baseurl}/api/auth/google)에서 로그인후 다시 진행해주세요!**`
      )
      return await interaction.editReply({ embeds: [errorEmbed] })
    } else {
      const chnnel_id = 'UCE9Wv-adygeb6PYcqLeRqbA'
      axios
        .get(
          `https://www.googleapis.com/youtube/v3/subscriptions?part=snippet&mine=true&forChannelId=${chnnel_id}`,
          {
            headers: {
              authorization: 'Bearer ' + userdb.google_accessToken
            }
          }
        )
        .then(async (data) => {
          const youtubeData: YoutubeChannels = data.data
          if (youtubeData.pageInfo.totalResults === 0) {
            const button1 = new MessageButton()
              .setCustomId('youtube.subscription')
              .setLabel('네')
              .setStyle('PRIMARY')
            const button2 = new MessageButton()
              .setCustomId('youtube.nosubscription')
              .setLabel('아니요')
              .setStyle('DANGER')
            const row = new MessageActionRow().addComponents([button1, button2])
            errorEmbed.setDescription(
              `**구독이 되어있지 않은 거 같아요!** \n 직접 구독해 드릴까요?`
            )
            await interaction.editReply({
              embeds: [errorEmbed],
              components: [row]
            })
            const collector =
              interaction.channel?.createMessageComponentCollector({
                time: 10000
              })
            collector?.on('collect', async (i) => {
              if (i.user.id !== interaction.user.id) return
              if (i.customId === 'youtube.subscription') {
                await axios
                  .post(
                    `https://www.googleapis.com/youtube/v3/subscriptions?part=snippet`,
                    {
                      snippet: {
                        resourceId: {
                          channelId: chnnel_id
                        }
                      }
                    },
                    {
                      headers: {
                        Authorization: 'Bearer ' + userdb?.google_accessToken,
                        redirect: 'follow'
                      }
                    }
                  )
                  .then(async (data) => {
                    successEmbed.setTitle('**성공적으로 구독되었어요!**')
                    return interaction.editReply({
                      embeds: [successEmbed],
                      components: []
                    })
                  })
                  .catch((err) => {
                    successEmbed.setTitle(
                      '**구독하기 중 오류가 발생했어요! 다시 시도해 주세요!**'
                    )
                    return interaction.editReply({
                      embeds: [successEmbed],
                      components: []
                    })
                  })
              } else if (i.customId === 'youtube.nosubscription') {
                errorEmbed.setDescription(`**구독하기가 취소되었습니다!**`)
                interaction.editReply({ embeds: [errorEmbed], components: [] })
              } else {
                return
              }
            })
            collector?.on('end', (collected) => {
              if (collected.size == 1) return
              interaction.editReply({
                embeds: [errorEmbed],
                components: [
                  new MessageActionRow().addComponents(
                    new MessageButton()
                      .setCustomId('accept')
                      .setLabel('시간 초과. 다시 시도해주세요...')
                      .setStyle('SECONDARY')
                      .setEmoji('⛔')
                      .setDisabled(true)
                  )
                ]
              })
            })
          } else {
            successEmbed.setTitle('**구독 인증이 완료되었어요!**')
            return interaction.editReply({
              embeds: [successEmbed],
              components: []
            })
          }
        })
        .catch((e: AxiosError) => {
          if (e.response?.status === 401) {
            errorEmbed.setDescription(
              `**유튜브 인증이 만료된 거 같아요! \n [여기](${config.web?.baseurl}/api/auth/google)에서 로그인후 다시 진행해주세요!**`
            )
            return interaction.editReply({ embeds: [errorEmbed] })
          }
        })
    }
  }
)
