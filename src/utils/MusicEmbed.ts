import { Track } from 'discord-player'
import { Client, MessageEmbedOptions, EmbedBuilder } from 'discord.js'
import config from '../../config'

export default class Embed extends EmbedBuilder {
  constructor(client: Client, track?: Track) {
    if (!client.isReady()) return

    const EmbedJSON: MessageEmbedOptions = {
      color: '#2f3136',
      timestamp: new Date(),
      footer: {
        text: client.user.username,
        icon_url: client.user.avatarURL() ?? undefined
      }
    }
    if (!track) {
      EmbedJSON.author = {
        name: '재생 중인 노래',
        iconURL: 'https://cdn.discordapp.com/emojis/667750713698549781.gif?v=1'
      }
      EmbedJSON.title =
        '❌ 노래가 재생 중이지 않아요!\n 해당 채널에 노래 제목을 입력해주세요!'
      EmbedJSON.description = `[대시보드](${config.web?.baseurl}) | [서포트 서버](https://discord.gg/WtGq7D7BZm) | [상태](https://battlebot.kr/status)`
      EmbedJSON.image = {
        url: 'https://cdn.discordapp.com/attachments/901745892418256910/941301364095586354/46144c4d9e1cf2e6.png'
      }
    } else {
      EmbedJSON.author = {
        name: '재생 중인 노래',
        iconURL: 'https://cdn.discordapp.com/emojis/667750713698549781.gif?v=1',
        url: track.url
      }
      EmbedJSON.description = `[대시보드](${config.web?.baseurl}) | [서포트 서버](https://discord.gg/WtGq7D7BZm) | [상태](https://battlebot.kr/status)`
      EmbedJSON.title = `${track.title} - ${track.author} (${track.duration})`
      EmbedJSON.image = {
        url: 'https://cdn.discordapp.com/attachments/901745892418256910/941301364095586354/46144c4d9e1cf2e6.png'
      }
      EmbedJSON.thumbnail = {
        url: track.thumbnail
          ? track.thumbnail
          : 'https://cdn.discordapp.com/attachments/901745892418256910/941249525069262888/image0_1.png'
      }
    }

    super(EmbedJSON)
  }
}
