import { BaseCommand } from '../../structures/Command'
import Discord from 'discord.js'
import Embed from '../../utils/Embed'
import comma from 'comma-number'
import Schema from '../../schemas/Money'
import config from '../../../config'
import { searchStock, searchStocks } from '../../utils/stock'

export default new BaseCommand(
  {
    name: 'stock',
    description: '주식을 거래합니다. (검색, 매수, 매도, 목록)',
    aliases: ['주식', 'stock', '주식거래', '주식거래하기']
  },
  async (client, message, args) => {
    const type = args[0]
    const embed = new Embed(client, 'info').setTitle('주식')
    const m = await message.reply({ embeds: [embed] })
    if (type === '검색') {
      const keyword = args.slice(1).join(' ')
      const results = await searchStocks(keyword)
      const result = await searchStock(results.result.d[0].cd)
      embed.setTitle(
        `${results.result.d[0].nm} (${results.result.d[0].cd}) ${comma(
          result.now
        )}원`
      )
      embed.setDescription(
        '```diff\n- 최고가 : ' +
          comma(result.high) +
          '원\n' +
          '최저가 : ' +
          comma(result.low) +
          '원\n' +
          '전일대비 : ' +
          result.diff +
          '원' +
          '```'
      )
      embed.setImage(
        `https://ssl.pstatic.net/imgfinance/chart/item/area/day/${results.result.d[0].cd}.png`
      )
      return m.edit({
        embeds: [embed]
      })
    } else if (type === '목록') {
      const keyword = args.slice(1).join(' ')
      const result = await searchStocks(keyword)
      embed.setTitle(`${keyword} 검색 결과`)
      const results = result.result.d.map((stock, index) => {
        return `${
          stock.rf == '1' || stock.rf == '2' ? '+' : stock.rf == '3' ? ' ' : '-'
        } ${index + 1}. ${stock.nm} (${stock.cd}) [ ${comma(stock.nv)}원 (${
          stock.rf == '1' || stock.rf == '2' ? '▴' : stock.rf == '3' ? '-' : '▾'
        } ${stock.cr}%) ]`
      })
      embed.setDescription('```diff\n' + results.join('\n') + '```')
      return m.edit({
        embeds: [embed]
      })
    } else if (type === '매수') {
    } else if (type === '매도') {
    } else {
      embed.setDescription(
        `\`${config.bot.prefix}주식 목록 (검색어)\` 검색어에 관련된 주식들을 찾아줍니다\n\`${config.bot.prefix}주식 검색 (검색어)\` 검색어에 관련된 주식을 찾아줍니다\n\`${config.bot.prefix}주식 매수 (이름) (개수)\` 입력하신 주식을 개수만큼 매도합니다\n\`${config.bot.prefix}주식 매도 (이름) (개수)\` 입력하신 주식을 개수만큼 매수합니다\n`
      )
      return m.edit({
        embeds: [embed]
      })
    }
  }
)
