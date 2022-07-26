import { BaseCommand } from '../../structures/Command'
import { SlashCommandBuilder } from '@discordjs/builders'
import Embed from '../../utils/Embed'
import { EmbedBuilder } from 'discord.js'
import cheerio from 'cheerio'
import request from 'request-promise'
import { anyid } from 'anyid'

export default new BaseCommand(
  {
    name: '롤전적',
    description: '리그오브레전드 전적을 확인합니다.',
    aliases: ['롤전적', 'lolstat']
  },
  async (client, message, args) => {
    return message.reply(
      `해당 명령어는 슬래쉬 커맨드 ( / )로만 사용이 가능합니다.`
    )
  },
  {
    data: new SlashCommandBuilder()
      .setName('롤전적')
      .addStringOption((user) =>
        user
          .setName('user')
          .setDescription('리그오브레전드 닉네임을 적어주세요')
          .setRequired(true)
      )
      .setDescription('유저의 리그오브레전드 전적을 확인합니다'),
    options: {
      name: '롤전적',
      isSlash: true
    },
    async execute(client, interaction) {
      await interaction.deferReply({ ephemeral: true })
      await interaction.editReply({
        embeds: [
          new Embed(client, 'info')
            .setDescription('전적을 불러오는 중..')
            .setColor('#2f3136')
        ]
      })
      let nickname = interaction.options.getString('user', true)
      let stats = await getStat(nickname)
      if (typeof stats === 'string') {
        return interaction.editReply({ embeds: [], content: stats })
      }
      return interaction.editReply({
        embeds: [stats]
      })
    }
  }
)

async function getStat(args: string) {
  let url = 'https://www.op.gg/summoner/userName=' + encodeURIComponent(args)
  let options = {
    url: url,
    method: 'GET',
    headers: {
      'Accept-Language': 'ko-KR,ko;q=0.8,en-US;q=0.5,en;q=0.3',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0) Gecko/20100101 Firefox/72.0'
    }
  }
  let html
  try {
    html = await request(options) // html 받아옴
  } catch (e) {
    console.log('error')
    return 'error'
  }
  var $ = cheerio.load(html)
  // @ts-ignore
  let data = JSON.parse($(`#__NEXT_DATA__`).contents()[0].data).props.pageProps
    .data
  // @ts-ignore
  let lastMatch = JSON.parse($(`#__NEXT_DATA__`).contents()[0].data).props
    .pageProps.games.data
  let champions: [] = data.championsById
  let matchinfo: string[] = []
  lastMatch.forEach((match: any) => {
    let championRes: any = champions[match.myData.champion_id]
    if (match.myData.stats.result === 'LOSE') {
      matchinfo.push(
        `- 패배 / ${match.queue_info.queue_translate} / <KDA ${
          match.myData.stats.kill
        }/${match.myData.stats.death}/${match.myData.stats.assist}> ${
          match.myData.position ? '/ ' + match.myData.position : ''
        }`
      )
    } else {
      matchinfo.push(
        `+ 승리 / ${match.queue_info.queue_translate} / ${
          championRes.name
        } / <KDA ${match.myData.stats.kill}/${match.myData.stats.death}/${
          match.myData.stats.assist
        }> ${match.myData.position ? '/ ' + match.myData.position : ''}`
      )
    }
  })
  let embed = new EmbedBuilder()
    .setTitle(`\`${args}\`의 프로필`)
    .setColor('#2f3136')
  let leagueStatus = data.league_stats[0]
  if (leagueStatus.tier_info.tier)
    embed.setDescription(
      `${leagueStatus.queue_info.queue_translate} - ${
        leagueStatus.tier_info.tier
      } ${leagueStatus.tier_info.division} (${
        leagueStatus.tier_info.lp
      }LP) \n ${leagueStatus.win}승 / ${leagueStatus.lose}패 / ${(
        (leagueStatus.win / (leagueStatus.win + leagueStatus.lose)) *
        100
      ).toFixed(2)}%`
    )
  else embed.setDescription(`**언랭크**`)
  return embed
    .addFields(
      '최근 10판 전적',
      `
    \`\`\`diff
${matchinfo.slice(undefined, 10).join('\n')} 
\`\`\``
    )
    .setThumbnail(leagueStatus.tier_info.tier_image_url)
}
