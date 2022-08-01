import { BaseCommand } from '../../structures/Command'
import Embed from '../../utils/Embed'
import Discord, { ButtonBuilder, ButtonStyle } from 'discord.js'
import Schema from '../../schemas/Money'
import axios from 'axios'
import config from '../../../config'
import DateFormatting from '../../utils/DateFormatting'
import HeartSchema from '../../schemas/HeartCheck'

export default new BaseCommand(
  {
    name: '하트인증',
    description: '한디리, 아카이브 하트를 인증합니다',
    aliases: ['하트인증', 'ㅎㅌㅇㅈ', 'heart']
  },
  async (client, message, args) => {
    let embed = new Embed(client, 'warn')
      .setTitle('하트인증')
      .setDescription(
        client.i18n.t('commands.heart.success.description.platform')
      )
      .setColor('#2f3136')
    const money = await Schema.findOne({ userid: message.author.id })
    if (!money) {
      embed.setTitle(client.i18n.t('main.error.title'))
      embed.setDescription(
        message.author +
          '님의 정보가 확인되지 않습니다.\n먼저 `!돈받기`를 입력해 정보를 알려주세요!'
      )
      return message.reply({ embeds: [embed] })
    }
    let m = await message.reply({
      embeds: [embed],
      components: [
        new Discord.ActionRowBuilder<ButtonBuilder>()
          .addComponents(
            new Discord.ButtonBuilder()
              .setLabel(`한디리 인증`)
              .setStyle(ButtonStyle.Primary)
              .setCustomId('heart.koreanlist')
          )
          .addComponents(
            new Discord.ButtonBuilder()
              .setLabel(`아카이브 인증`)
              .setStyle(ButtonStyle.Primary)
              .setCustomId('heart.archive')
          )
      ]
    })
    const collector = m.createMessageComponentCollector({ time: 10000 })
    collector.on('collect', async (i) => {
      if (i.user.id != message.author.id) return
      if (i.customId == 'heart.koreanlist') {
        axios
          .get(
            `https://koreanbots.dev/api/v2/bots/${client.user?.id}/vote?userID=${message.author.id}`,
            {
              headers: {
                Authorization: config.updateServer.koreanbots,
                'Content-Type': 'application/json'
              }
            }
          )
          .then(async (res) => {
            if (!res.data.data.voted) {
              embed = new Embed(client, 'warn')
                .setTitle('한국 디스코드 리스트 봇 하트인증')
                .setDescription(
                  client.i18n.t(
                    'commands.heart.success.description.koreanbotslist'
                  )
                )
                .setTimestamp()
                .setColor('#2f3136')
              let link =
                new Discord.ActionRowBuilder<ButtonBuilder>().addComponents(
                  new Discord.ButtonBuilder()
                    .setURL(
                      `https://koreanbots.dev/bots/${client.user?.id}/vote`
                    )
                    .setLabel(
                      client.i18n.t('commands.heart.success.button.heart')
                    )
                    .setStyle(ButtonStyle.Link)
                )
              i.reply({
                embeds: [embed],
                components: [link]
              })
              return m.edit({ components: [] })
            } else {
              const heartData = await HeartSchema.findOne({
                userid: message.author.id,
                platform: 'koreanlist'
              })
              if (!heartData) {
                await Schema.updateOne(
                  { userid: message.author.id },
                  { $inc: { money: 50000 } }
                )
                await HeartSchema.create({
                  userid: message.author.id,
                  platform: 'koreanlist'
                })
                embed = new Embed(client, 'success')
                  .setTitle(
                    client.i18n.t('commands.heart.success.title.success')
                  )
                  .setDescription(
                    `${message.author.username}님의 한국 디스코드 리스트에 있는 배틀이 봇의 하트인증이 완료되었습니다.`
                  )
                  .setTimestamp()
                  .setColor('#2f3136')
                i.reply({
                  embeds: [embed]
                })
                return m.edit({ components: [] })
              } else {
                embed = new Embed(client, 'success')
                  .setTitle(client.i18n.t('commands.heart.success.title.fail'))
                  .setDescription(
                    `${DateFormatting._format(
                      res.data.data.lastVote + 12 * 60 * 60 * 1000,
                      'R'
                    )} 뒤에 다시 인증해주세요!`
                  )
                  .setTimestamp()
                  .setColor('#2f3136')
                i.reply({
                  embeds: [embed]
                })
                return m.edit({ components: [] })
              }
            }
          })
          .catch((e) => {
            embed = new Embed(client, 'error')
              .setTitle(client.i18n.t('main.error.title'))
              .setDescription(`하트 인증중 오류가 발생했어요! ${e.message}`)
              .setFooter({ text: `${message.author.tag}` })
              .setTimestamp()
              .setColor('#2f3136')
            i.reply({
              embeds: [embed]
            })
            return m.edit({ components: [] })
          })
      } else if (i.customId == 'heart.archive') {
        axios
          .get(
            `https://api.archiver.me/bots/${client.user?.id}/like/${message.author.id}`,
            {
              headers: {
                Authorization: 'Bearer ' + config.updateServer.archive,
                'Content-Type': 'application/json'
              }
            }
          )
          .then(async (res) => {
            if (!res.data.data.like) {
              embed = new Embed(client, 'warn')
                .setTitle('아카이브 봇 하트인증')
                .setDescription(
                  client.i18n.t('commands.heart.success.description.archive')
                )
                .setTimestamp()
                .setColor('#2f3136')
              let link =
                new Discord.ActionRowBuilder<ButtonBuilder>().addComponents(
                  new Discord.ButtonBuilder()
                    .setURL(`https://archiver.me/bots/${client.user?.id}/like`)
                    .setLabel(
                      client.i18n.t('commands.heart.success.button.heart')
                    )
                    .setStyle(ButtonStyle.Link)
                )
              i.reply({
                embeds: [embed],
                components: [link]
              })
              return m.edit({ components: [] })
            } else {
              const heartData = await HeartSchema.findOne({
                userid: message.author.id,
                platform: 'archive'
              })
              if (!heartData) {
                await Schema.updateOne(
                  { userid: message.author.id },
                  { $inc: { money: 50000 } }
                )
                await HeartSchema.create({
                  userid: message.author.id,
                  platform: 'archive'
                })
                embed = new Embed(client, 'success')
                  .setTitle(
                    client.i18n.t('commands.heart.success.title.success')
                  )
                  .setDescription(
                    `${message.author.username}님의 아카이브에 있는 배틀이 봇의 하트인증이 완료되었습니다.`
                  )
                  .setTimestamp()
                  .setColor('#2f3136')
                i.reply({
                  embeds: [embed]
                })
                return m.edit({ components: [] })
              } else {
                embed = new Embed(client, 'success')
                  .setTitle(client.i18n.t('commands.heart.success.title.fail'))
                  .setDescription(
                    `${DateFormatting._format(
                      res.data.data.lastLike + 24 * 60 * 60 * 1000,
                      'R'
                    )} 뒤에 다시 인증해주세요!`
                  )
                  .setTimestamp()
                  .setColor('#2f3136')
                i.reply({
                  embeds: [embed]
                })
                return m.edit({ components: [] })
              }
            }
          })
          .catch((e) => {
            embed = new Embed(client, 'error')
              .setTitle(client.i18n.t('main.error.title'))
              .setDescription(`하트 인증중 오류가 발생했어요! ${e.message}`)
              .setFooter({ text: `${message.author.tag}` })
              .setTimestamp()
              .setColor('#2f3136')
            i.reply({
              embeds: [embed]
            })
            return m.edit({ components: [] })
          })
      }
    })
    collector.on('end', (collected) => {
      if (collected.size == 1) return
      m.edit({
        embeds: [embed],
        components: [
          new Discord.ActionRowBuilder<ButtonBuilder>()
            .addComponents(
              new Discord.ButtonBuilder()
                .setLabel(
                  client.i18n.t('commands.heart.success.button.koreanbotslist')
                )
                .setStyle(ButtonStyle.Primary)
                .setCustomId('heart.koreanlist')
                .setDisabled(true)
            )
            .addComponents(
              new Discord.ButtonBuilder()
                .setLabel(
                  client.i18n.t('commands.heart.success.button.archive')
                )
                .setStyle(ButtonStyle.Primary)
                .setCustomId('heart.archive')
                .setDisabled(true)
            )
        ]
      })
    })
  }
)
