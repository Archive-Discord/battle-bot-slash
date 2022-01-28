import { GuildMember, GuildScheduledEvent } = require("discord.js")
import { value } from"mongoose/lib/options/propertyOptions")
import { LoggerSetting } from"../schemas/LogSettingSchema")
import DateFormatting from"../utils/DateFormatting")
import LogEmbed from"../utils/LogEmbed")

export default {
  name: "guildScheduledEventCreate",
  /**
   *
   * @param {import('../structures/BotClient')} client
   * @param {GuildScheduledEvent} guildScheduledEvent
   */
  async execute(client, guildScheduledEvent) {
    let LoggerSettingDB = await LoggerSetting.findOne({
      guild_id: guildScheduledEvent.guild.id,
    })
    if (!LoggerSettingDB) return
    if (!LoggerSettingDB.useing.memberJoin) return
    let logChannel = guildScheduledEvent.guild.channels.cache.get(
      LoggerSettingDB.guild_channel_id
    )
    if (!logChannel) return
    let embed = new LogEmbed(client, "success")
      .setDescription("이벤트 추가")
      .addFields(
        {
          name: "이름",
          value: guildScheduledEvent.name,
        },
        {
          name: "설명",
          value: guildScheduledEvent.description
            ? guildScheduledEvent.description
            : "없음",
        },
        {
          name: "시작일",
          value: guildScheduledEvent.scheduledStartAt
            ? DateFormatting.relative(
                guildScheduledEvent.scheduledStartTimestamp
              )
            : "없음",
        },
        {
          name: "종료일",
          value: guildScheduledEvent.scheduledEndAt
            ? DateFormatting.relative(guildScheduledEvent.scheduledEndTimestamp)
            : "없음",
        },
        {
          name: "생성자",
          value:
            `<@${guildScheduledEvent.creator.id}>` +
            "(`" +
            guildScheduledEvent.creator.id +
            "`)",
        },
        {
          name: "장소",
          value: guildScheduledEvent.channel
            ? `<#${guildScheduledEvent.channel.id}>` +
              "(`" +
              guildScheduledEvent.channel.id +
              "`)"
            : guildScheduledEvent.entityMetadata.location,
        }
      )
    return await logChannel.send({ embeds: [embed] })
  },
}
