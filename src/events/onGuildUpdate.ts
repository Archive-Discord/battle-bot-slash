import { TextChannel } from 'discord.js'
import LoggerSetting from '../schemas/LogSettingSchema'
import Embed from '../utils/Embed'
import { Event } from '../structures/Event'

export default new Event('guildUpdate', async (client, oldGuild, newGuild) => {
  const LoggerSettingDB = await LoggerSetting.findOne({ guild_id: newGuild.id })
  if (!LoggerSettingDB) return
  if (!LoggerSettingDB.useing.serverSetting) return
  const logChannel = newGuild.channels.cache.get(
    LoggerSettingDB.guild_channel_id
  ) as TextChannel
  if (!logChannel) return
  let update = false
  const embed = new Embed(client, 'warn').setTitle('서버 수정')
  if (oldGuild.name != newGuild.name) {
    embed.addFields(
      '이름 수정',
      '`' + oldGuild.name + '`' + ' -> ' + '`' + newGuild.name + '`'
    )
    update = true
  }
  if (oldGuild.premiumTier !== newGuild.premiumTier) {
    embed.addFields(
      `부스트 ${
        oldGuild.premiumTier < newGuild.premiumTier ? '추가됨' : '차감됨'
      }`,
      '`' +
        oldGuild.premiumTier +
        '`' +
        ' -> ' +
        '`' +
        newGuild.premiumTier +
        '`'
    )
    update = true
  }
  if (!oldGuild.banner && newGuild.banner) {
    embed.addFields(
      '배너 수정',
      '`' + oldGuild.banner + '`' + ' -> ' + '`' + newGuild.banner + '`'
    )
    update = true
  }
  if (!oldGuild.afkChannel && newGuild.afkChannel) {
    embed.addFields(
      '잠수 채널 수정',
      (oldGuild.afkChannelId
        ? `<#${oldGuild.afkChannelId}>` + '(`' + oldGuild.afkChannelId + '`)'
        : '`없음`') +
        ' -> ' +
        (newGuild.afkChannelId
          ? `<#${newGuild.afkChannelId}>` + '(`' + newGuild.afkChannelId + '`)'
          : '`없음`')
    )
    update = true
  }
  if (!oldGuild.vanityURLCode && newGuild.vanityURLCode) {
    embed.addFields(
      '초대 링크 수정',
      (oldGuild.vanityURLCode ? oldGuild.vanityURLCode : '`없음`') +
        ' -> ' +
        (newGuild.vanityURLCode ? newGuild.vanityURLCode : '`없음`')
    )
    update = true
  }
  if (oldGuild.afkTimeout !== newGuild.afkTimeout) {
    embed.addFields(
      '잠수 시간 수정',
      '`' +
        oldGuild.afkTimeout / 60 +
        '분' +
        '`' +
        ' -> ' +
        '`' +
        newGuild.afkTimeout / 60 +
        '분' +
        '`'
    )
    update = true
  }
  if (oldGuild.ownerId !== newGuild.ownerId) {
    embed.addFields(
      '서버 주인 변경',
      `<@${oldGuild.ownerId}>` +
        '(`' +
        oldGuild.ownerId +
        '`)' +
        ' -> ' +
        `<@${newGuild.ownerId}>` +
        '(`' +
        newGuild.ownerId +
        '`)'
    )
    update = true
  }
  if (oldGuild.systemChannelId !== newGuild.systemChannelId) {
    embed.addFields(
      '시스템 채널 변경',
      `<#${oldGuild.systemChannelId}>` +
        '(`' +
        oldGuild.systemChannelId +
        '`)' +
        ' -> ' +
        `<#${newGuild.systemChannelId}>` +
        '(`' +
        newGuild.systemChannelId +
        '`)'
    )
    update = true
  }
  if (update) return await logChannel.send({ embeds: [embed] })
})
