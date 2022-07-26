import { TextChannel, User } from 'discord.js'
import LoggerSetting from '../schemas/LogSettingSchema'
import Embed from '../utils/Embed'
import { Event } from '../structures/Event'
export default new Event(
  'guildMemberUpdate',
  async (client, oldMember, newMember) => {
    const LoggerSettingDB = await LoggerSetting.findOne({
      guild_id: newMember.guild.id
    })
    if (!LoggerSettingDB) return
    if (!LoggerSettingDB.useing.memberUpdate) return
    const logChannel = newMember.guild.channels.cache.get(
      LoggerSettingDB.guild_channel_id
    ) as TextChannel
    if (!logChannel) return
    let update = false
    const embed = new Embed(client, 'warn')
      .setTitle('멤버 수정')
      .addFields(
        '유저',
        `<@${newMember.user.id}>` + '(`' + newMember.user.id + '`)'
      )
    if (oldMember.nickname !== newMember.nickname) {
      const fetchedLogs = await newMember.guild.fetchAuditLogs({
        limit: 1,
        type: 'MEMBER_UPDATE'
      })
      const deletionLog = fetchedLogs.entries.first()
      if (deletionLog) {
        const executor = deletionLog.executor as User
        const target = deletionLog.target as User
        if (target.id === newMember.id && executor.id !== newMember.id)
          embed.addFields(
            '수정유저',
            `<@${executor.id}>` + '(`' + executor.id + '`)'
          )
      }
      embed.addFields(
        '닉네임 수정',
        '`' +
          (oldMember.nickname ? oldMember.nickname : oldMember.user.username) +
          '`' +
          ' ->' +
          '`' +
          (newMember.nickname ? newMember.nickname : newMember.user.username) +
          '`'
      )
      update = true
    }
    if (!oldMember.premiumSince && newMember.premiumSince) {
      embed.addFields(
        '서버 부스트',
        `<@${newMember.user.id}>` +
          '(`' +
          newMember.user.id +
          '`)' +
          ' 님이 서버를 부스트 했습니다'
      )
      update = true
    }
    if (oldMember.roles.cache.size !== newMember.roles.cache.size) {
      const fetchedLogs = await newMember.guild.fetchAuditLogs({
        limit: 1,
        type: 'MEMBER_ROLE_UPDATE'
      })
      const deletionLog = fetchedLogs.entries.first()
      if (deletionLog) {
        const executor = deletionLog.executor as User
        const target = deletionLog.target as User
        if (target.id === newMember.id)
          embed.addFields(
            '수정유저',
            `<@${executor.id}>` + '(`' + executor.id + '`)'
          )
      }
      if (oldMember.roles.cache.size > newMember.roles.cache.size) {
        oldMember.roles.cache.forEach((role) => {
          if (!newMember.roles.cache.has(role.id)) {
            embed.addFields(
              '역할 삭제',
              `<@&${role.id}>` + '(`' + role.id + '`)'
            )
            update = true
          }
        })
      } else if (oldMember.roles.cache.size < newMember.roles.cache.size) {
        newMember.roles.cache.forEach((role) => {
          if (!oldMember.roles.cache.has(role.id)) {
            embed.addFields(
              '역할 추가',
              `<@&${role.id}>` + '(`' + role.id + '`)'
            )
            update = true
          }
        })
      }
    }
    if (update) return await logChannel.send({ embeds: [embed] })
  }
)
