import { BaseCommand } from '../../structures/Command'
import Discord from 'discord.js'
import Embed from '../../utils/Embed'
import comma from 'comma-number'
import Schema from '../../schemas/Money'
import StockSchema, { Stock } from '../../schemas/Stock'
import config from '../../../config'
import {
  searchStock,
  searchStocks,
  searchStockList,
  stock
} from '../../utils/stock'

export default new BaseCommand(
  {
    name: 'stock',
    description: '주식을 거래합니다. (검색, 매수, 매도, 목록)',
    aliases: ['주식', 'stock', '주식거래', '주식거래하기']
  },
  async (client, message, args) => {
    const type = args[0]
    const embed = new Embed(client, 'info').setTitle('주식').setColor('#2f3136')
    if (type === '검색') {
      const keyword = args.slice(1).join(' ')
      const results = await searchStockList(keyword)
      if (!results || results?.items.length == 0) {
        embed.setDescription('검색 결과가 없습니다.')
        return message.reply({ embeds: [embed] })
      }
      const result = await searchStock(results.items[0].code)
      if (!result) {
        embed.setDescription('검색 결과가 없습니다.')
        return message.reply({ embeds: [embed] })
      }
      embed.setTitle(`${results.items[0].name} (${results.items[0].code})`)
      embed.addField('현재가', `${comma(result.now)}원`, true)
      embed.addField(
        '전일대비',
        `${comma(result.diff)}원 (${
          result.risefall == 1 || result.risefall == 2
            ? '▴'
            : result.risefall == 3
            ? '-'
            : '▾'
        } ${comma(result.rate)}%)`,
        true
      )
      embed.addField('거래량', `${comma(result.quant)}주`, true)
      embed.addField('고가', `${comma(result.high)}원`, true)
      embed.addField('저가', `${comma(result.low)}원`, true)
      embed.addField('거래대금', `${comma(result.amount)}백만원`, true)
      embed.setImage(
        `https://ssl.pstatic.net/imgfinance/chart/item/area/day/${results.items[0].code}.png`
      )
      return message.reply({
        embeds: [embed]
      })
    } else if (type === '목록') {
      const keyword = args.slice(1).join(' ')
      const result = await searchStocks(keyword)
      embed.setTitle(`${keyword} 검색 결과`)
      const results = result?.result.d.map((stock, index) => {
        return `${
          stock.rf == '1' || stock.rf == '2' ? '+' : stock.rf == '3' ? ' ' : '-'
        } ${index + 1}. ${stock.nm} (${stock.cd}) [ ${comma(stock.nv)}원 (${
          stock.rf == '1' || stock.rf == '2' ? '▴' : stock.rf == '3' ? '-' : '▾'
        } ${stock.cr}%) ]`
      })
      embed.setDescription('```diff\n' + results?.join('\n') + '```')
      return message.reply({
        embeds: [embed]
      })
    } else if (type === '매수') {
      const keyword = args.slice(2).join(' ')
      const quantity = parseInt(args[1])
      if (!quantity) {
        embed.setDescription(`매수하실 주식의 수량을 숫자만 입력해주세요.`)
        return message.reply({ embeds: [embed] })
      }
      if (quantity < 1) {
        embed.setDescription(
          `매수하실 주식의 수량은 1이상의 숫자만 입력해주세요.`
        )
        return message.reply({ embeds: [embed] })
      }
      const results = await searchStockList(keyword)
      if (!results || results?.items.length == 0) {
        embed.setDescription(`${keyword} 검색 결과가 없습니다.`)
        return message.reply({ embeds: [embed] })
      }
      const result = await searchStock(results.items[0].code)
      if (!result) {
        embed.setDescription(`${keyword} 검색 결과가 없습니다.`)
        return message.reply({ embeds: [embed] })
      }
      const price = result.now * quantity
      const fee = price * 0.02
      const total = price + fee
      const user = await Schema.findOne({ userid: message.author.id })
      if (!user) {
        embed.setDescription(
          `등록되어 있지 않은 유저인 거 같아요!, 먼저 \`${config.bot.prefix}돈받기\` 명령어로 등록을 해주세요.`
        )
        return message.reply({ embeds: [embed] })
      }
      if (user.money < total) {
        embed.setDescription(
          `${comma(total - user.money)}원이 부족해요!\n잔액은 ${comma(
            user.money
          )}원이에요.`
        )
        return message.reply({ embeds: [embed] })
      }
      embed.setDescription(
        `${results.items[0].name} ${quantity}주(${comma(
          result.now * quantity
        )}원)을 매수하시겠습니까?`
      )
      embed.addField('현재가', `${comma(result.now)}원`, true)
      embed.addField('수수료', `${comma(fee)}원 (2%)`, true)
      embed.addField('총계', `${comma(total)}원`, true)
      embed.setImage(
        `https://ssl.pstatic.net/imgfinance/chart/item/area/day/${results.items[0].code}.png`
      )
      const row = new Discord.MessageActionRow()
        .addComponents(
          new Discord.MessageButton()
            .setCustomId('stock.accept')
            .setLabel('확인')
            .setStyle('SUCCESS')
        )
        .addComponents(
          new Discord.MessageButton()
            .setCustomId('stock.deny')
            .setLabel('아니요')
            .setStyle('DANGER')
        )
      const m = await message.reply({ embeds: [embed], components: [row] })
      const collector = m.createMessageComponentCollector({ time: 10000 })
      collector.on('collect', async (i) => {
        if (i.user.id != message.author.id) return
        if (i.customId == 'stock.accept') {
          embed.setDescription(
            `${results.items[0].name} ${quantity}주를 매수했어요!`
          )
          embed.addField('현재가', `${comma(result.now)}원`, true)
          embed.addField('수수료', `${comma(fee)}원 (2%)`, true)
          embed.addField('총계', `${comma(total)}원`, true)
          embed.setImage(
            `https://ssl.pstatic.net/imgfinance/chart/item/area/day/${results.items[0].code}.png`
          )
          await m.edit({ embeds: [embed] })
          await Schema.findOneAndUpdate(
            {
              userid: message.author.id
            },
            {
              $inc: { money: -total }
            }
          )
          const nowStock = await StockSchema.findOne({
            userid: message.author.id,
            'stocks.code': results.items[0].code
          })
          if (!nowStock) {
            await StockSchema.updateOne(
              { userid: message.author.id },
              {
                $push: {
                  stocks: {
                    code: results.items[0].code,
                    quantity,
                    name: results.items[0].name,
                    price: result.now
                  }
                }
              },
              { upsert: true }
            )
          } else {
            await StockSchema.findOneAndUpdate(
              { userid: message.author.id },
              { $pull: { stocks: { code: results.items[0].code } } }
            )
            await StockSchema.updateOne(
              { userid: message.author.id },
              {
                $push: {
                  stocks: {
                    code: results.items[0].code,
                    quantity: nowStock.stocks[0].quantity + quantity,
                    name: results.items[0].name,
                    price:
                      (nowStock.stocks[0].quantity * nowStock.stocks[0].price +
                        result.now * quantity) /
                      (nowStock.stocks[0].quantity + quantity)
                  }
                }
              },
              { upsert: true }
            )
          }
          const successEmbed = new Embed(client, 'success')
            .setTitle(`주식`)
            .setDescription(
              `${results.items[0].name} ${quantity}주를 매수했어요!`
            )
            .addField('거래금액', `${comma(total)}원`, true)
            .addField('수수료', `${comma(fee)}원 (2%)`, true)
            .addField('거래후 잔액', `${comma(user.money - total)}원`, true)
          return i.update({ embeds: [successEmbed], components: [] })
        } else if (i.customId == 'stock.deny') {
          embed.setDescription(`매수를 취소하였습니다.`)
          return i.update({ embeds: [embed], components: [] })
        }
      })
      collector.on('end', (collected) => {
        if (collected.size == 1) return
        m.edit({
          embeds: [embed],
          components: [
            new Discord.MessageActionRow()
              .addComponents(
                new Discord.MessageButton()
                  .setCustomId('stock.accept')
                  .setLabel('확인')
                  .setStyle('SUCCESS')
                  .setDisabled(true)
              )
              .addComponents(
                new Discord.MessageButton()
                  .setCustomId('stock.deny')
                  .setLabel('아니요')
                  .setStyle('DANGER')
                  .setDisabled(true)
              )
          ]
        })
      })
    } else if (type === '매도') {
      const keyword = args.slice(2).join(' ')
      const quantity = parseInt(args[1])
      if (!quantity) {
        embed.setDescription(`매도하실 주식의 수량을 숫자만 입력해주세요.`)
        return message.reply({ embeds: [embed] })
      }
      if (quantity < 1) {
        embed.setDescription(
          `매수하실 주식의 수량을 1이상의 숫자만 입력해주세요.`
        )
        return message.reply({ embeds: [embed] })
      }
      embed.setDescription(`매수하실 주식의 수량을 숫자만 입력해주세요.`)
      const results = await searchStockList(keyword)
      if (!results || results?.items.length == 0) {
        embed.setDescription(`${keyword} 검색 결과가 없습니다.`)
        return message.reply({ embeds: [embed] })
      }
      const result = await searchStock(results.items[0].code)
      if (!result) {
        embed.setDescription(`${keyword} 검색 결과가 없습니다.`)
        return message.reply({ embeds: [embed] })
      }
      const stock = await StockSchema.findOne({
        userid: message.author.id,
        'stocks.code': results.items[0].code
      })
      if (!stock || stock.stocks.length === 0) {
        embed.setDescription(
          `${results.items[0].name}을 보유하고 있지 않습니다.`
        )
        return message.reply({ embeds: [embed] })
      }
      if (stock.stocks[0].quantity < quantity) {
        embed.setDescription(
          `${results.items[0].name}주식을 ${quantity}주만큼 보유하고 있지 않습니다. 현재 보유량: ${stock.stocks[0].quantity}주`
        )
        return message.reply({ embeds: [embed] })
      }
      const price = result.now * quantity
      const fee = price * 0.02
      const total = price - fee
      const user = await Schema.findOne({ userid: message.author.id })
      if (!user) {
        embed.setDescription(
          `등록되어 있지 않은 유저인 거 같아요!, 먼저 \`${config.bot.prefix}돈받기\` 명령어로 등록을 해주세요.`
        )
        return message.reply({ embeds: [embed] })
      }
      embed.setDescription(
        `${results.items[0].name} ${quantity}주(${comma(
          result.now * quantity
        )}원)을 매도하시겠습니까?`
      )
      embed.addField('현재가', `${comma(result.now)}원`, true)
      embed.addField('수수료', `${comma(fee)}원 (2%)`, true)
      embed.addField('총계', `${comma(total)}원`, true)
      embed.setImage(
        `https://ssl.pstatic.net/imgfinance/chart/item/area/day/${results.items[0].code}.png`
      )
      const row = new Discord.MessageActionRow()
        .addComponents(
          new Discord.MessageButton()
            .setCustomId('stocksell.accept')
            .setLabel('확인')
            .setStyle('SUCCESS')
        )
        .addComponents(
          new Discord.MessageButton()
            .setCustomId('stocksell.deny')
            .setLabel('아니요')
            .setStyle('DANGER')
        )
      const m = await message.reply({ embeds: [embed], components: [row] })
      const collector = m.createMessageComponentCollector({ time: 10000 })
      collector.on('collect', async (i) => {
        if (i.user.id != message.author.id) return
        if (i.customId == 'stocksell.accept') {
          embed.setDescription(
            `${results.items[0].name} ${quantity}주를 매도했어요!`
          )
          embed.addField('현재가', `${comma(result.now)}원`, true)
          embed.addField('수수료', `${comma(fee)}원 (2%)`, true)
          embed.addField('총계', `${comma(total)}원`, true)
          embed.setImage(
            `https://ssl.pstatic.net/imgfinance/chart/item/area/day/${results.items[0].code}.png`
          )
          await m.edit({ embeds: [embed] })
          await Schema.findOneAndUpdate(
            {
              userid: message.author.id
            },
            {
              $inc: { money: +total }
            }
          )
          await StockSchema.findOneAndUpdate(
            { userid: message.author.id },
            { $pull: { stocks: { code: stock.stocks[0].code } } }
          )
          await StockSchema.updateOne(
            { userid: message.author.id },
            {
              $push: {
                stocks: {
                  code: results.items[0].code,
                  quantity: stock.stocks[0].quantity - quantity,
                  name: results.items[0].name,
                  price: stock.stocks[0].price
                }
              }
            }
          )
          const successEmbed = new Embed(client, 'success')
            .setTitle(`주식`)
            .setDescription(
              `${results.items[0].name} ${quantity}주를 매도했어요!`
            )
            .addField('거래금액', `${comma(total)}원`, true)
            .addField('수수료', `${comma(fee)}원 (2%)`, true)
            .addField('거래후 잔액', `${comma(user.money + total)}원`, true)
          return i.update({ embeds: [successEmbed], components: [] })
        } else if (i.customId == 'stocksell.deny') {
          embed.setDescription(`매도를 취소하였습니다.`)
          return i.update({ embeds: [embed], components: [] })
        }
      })
      collector.on('end', (collected) => {
        if (collected.size == 1) return
        m.edit({
          embeds: [embed],
          components: [
            new Discord.MessageActionRow()
              .addComponents(
                new Discord.MessageButton()
                  .setCustomId('stock.accept')
                  .setLabel('확인')
                  .setStyle('SUCCESS')
                  .setDisabled(true)
              )
              .addComponents(
                new Discord.MessageButton()
                  .setCustomId('stock.deny')
                  .setLabel('아니요')
                  .setStyle('DANGER')
                  .setDisabled(true)
              )
          ]
        })
      })
    } else if (args[0] == '보유') {
      const nowStock = await StockSchema.findOne({ userid: message.author.id })
      if (!nowStock) {
        embed.setDescription(
          `보유중인 주식이없습니다, 먼저 \`${config.bot.prefix}주식\` 명령어로 주식 명령어를 확인해보세요!`
        )
        return message.reply({
          embeds: [embed]
        })
      } else {
        embed.setTitle(`${message.author.username}님의 보유중인 주식`)

        const results = await Promise.all(
          nowStock.stocks.map(async (stock, index) => {
            const stockSearch = await searchStock(stock.code)
            if (!stockSearch)
              return `- ${index + 1}. ${stock.name} ${stock.quantity}주 ${comma(
                Math.round(stock.price * stock.quantity)
              )}원 (실시간 정보 확인불가)`
            return `${
              Math.round(stockSearch.now) > Math.round(stock.price)
                ? '-'
                : Math.round(stockSearch.now) < Math.round(stock.price)
                ? '+'
                : ' '
            } ${index + 1}. ${stock.name} ${stock.quantity}주 [ ${
              Math.round(stockSearch.now * stock.quantity) >
              Math.round(stock.price * stock.quantity)
                ? '▾'
                : Math.round(stockSearch.now * stock.quantity) <
                  Math.round(stock.price * stock.quantity)
                ? '▴'
                : '-'
            } ${comma(Math.round(stock.price * stock.quantity))}원 ]`
          })
        )
        embed.setDescription('```diff\n' + results.join('\n') + '```')
        return message.reply({
          embeds: [embed]
        })
      }
    } else {
      embed.setTitle('주식 도움말')
      embed.setDescription('아래에 있는 명령어로 주식을 사용해보세요!')
      embed.addField(
        `\`${config.bot.prefix}주식 목록 (주식명)\``,
        '> 검색한 주식들의 목록을 확인합니다',
        true
      )
      embed.addField(
        `\`${config.bot.prefix}주식 검색 (주식명)\``,
        '> 검색한 주식의 상세 정보를 확인합니다.',
        true
      )
      embed.addField(
        `\`${config.bot.prefix}주식 매수 (개수) (주식명)\``,
        '> 입력한 주식을 개수만큼 매수합니다.',
        true
      )
      embed.addField(
        `\`${config.bot.prefix}주식 매도 (개수) (주식명)\``,
        '> 입력한 주식을 개수만큼 매도합니다.',
        true
      )
      embed.addField(
        `\`${config.bot.prefix}주식 보유\``,
        '> 보유중인 주식을 확인합니다.',
        true
      )
      return message.reply({
        embeds: [embed]
      })
    }
  }
)
