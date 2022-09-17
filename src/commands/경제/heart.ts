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
      .setTitle(client.i18n.t('commands.heart.title.heart'))
      .setDescription(client.i18n.t('commands.heart.description.platform'))
      .setColor('#2f3136')
    const money = await Schema.findOne({ userid: message.author.id })
    if (!money) {
      embed.setTitle(client.i18n.t('main.title.error'))
      embed.setDescription(
        client.i18n.t('commands.heart.description.account', {
          author: message.author
        })
      )
      return message.reply({ embeds: [embed] })
    }
    let m = await message.reply({
      embeds: [embed],
      components: [
        new Discord.ActionRowBuilder<ButtonBuilder>()
          .addComponents(
            new Discord.ButtonBuilder()
              .setLabel(client.i18n.t('commands.heart.button.kbl'))
              .setStyle(ButtonStyle.Primary)
              .setCustomId('heart.koreanlist')
          )
          .addComponents(
            new Discord.ButtonBuilder()
              .setLabel(client.i18n.t('commands.heart.button.archive'))
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
                .setTitle(client.i18n.t('commands.heart.title.kbl'))
                .setDescription(client.i18n.t('commands.heart.description.kbl'))
                .setTimestamp()
                .setColor('#2f3136')
              let link =
                new Discord.ActionRowBuilder<ButtonBuilder>().addComponents(
                  new Discord.ButtonBuilder()
                    .setURL(
                      `https://koreanbots.dev/bots/${client.user?.id}/vote`
                    )
                    .setLabel(client.i18n.t('commands.heart.button.heart'))
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
                  .setTitle(client.i18n.t('commands.heart.title.success'))
                  .setDescription(
                    client.i18n.t('commands.heart.description.successkbl', {
                      username: message.author.username
                    })
                  )
                  .setTimestamp()
                  .setColor('#2f3136')
                i.reply({
                  embeds: [embed]
                })
                return m.edit({ components: [] })
              } else {
                embed = new Embed(client, 'success')
                  .setTitle(client.i18n.t('commands.heart.title.fail'))
                  .setDescription(
                    `${DateFormatting._format(
                      res.data.data.lastVote + 12 * 60 * 60 * 1000,
                      'R'
                    )}` + client.i18n.t('commands.heart.description.later')
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
              .setTitle(client.i18n.t('main.title.error'))
              .setDescription(
                client.i18n.t('commands.heart.description.error', {
                  mesg: e.message
                })
              )
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
                .setTitle(client.i18n.t('commands.heart.title.archive'))
                .setDescription(
                  client.i18n.t('commands.heart.description.archive')
                )
                .setTimestamp()
                .setColor('#2f3136')
              let link =
                new Discord.ActionRowBuilder<ButtonBuilder>().addComponents(
                  new Discord.ButtonBuilder()
                    .setURL(`https://archiver.me/bots/${client.user?.id}/like`)
                    .setLabel(client.i18n.t('commands.heart.button.heart'))
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
                  .setTitle(client.i18n.t('commands.heart.title.success'))
                  .setDescription(
                    client.i18n.t('commands.heart.description.successac', {
                      username: message.author.username
                    })
                  )
                  .setTimestamp()
                  .setColor('#2f3136')
                i.reply({
                  embeds: [embed]
                })
                return m.edit({ components: [] })
              } else {
                embed = new Embed(client, 'success')
                  .setTitle(client.i18n.t('commands.heart.title.fail'))
                  .setDescription(
                    `${DateFormatting._format(
                      res.data.data.lastVote + 12 * 60 * 60 * 1000,
                      'R'
                    )}` + client.i18n.t('commands.heart.description.later')
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
              .setTitle(client.i18n.t('main.title.error'))
              .setDescription(
                client.i18n.t('commands.heart.description.error', {
                  mesg: e.message
                })
              )
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
                .setLabel(client.i18n.t('commands.heart.button.kbl'))
                .setStyle(ButtonStyle.Primary)
                .setCustomId('heart.koreanlist')
                .setDisabled(true)
            )
            .addComponents(
              new Discord.ButtonBuilder()
                .setLabel(client.i18n.t('commands.heart.button.archive'))
                .setStyle(ButtonStyle.Primary)
                .setCustomId('heart.archive')
                .setDisabled(true)
            )
        ]
      })
    })
  }
)
