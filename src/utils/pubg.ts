import {
  CommandInteraction,
  MessageActionRow,
  MessageButton,
  MessageEmbed
} from 'discord.js'
import {
  Client as PUBGClient,
  GameModeStatGamemode,
  Season,
  Shard
} from 'archive-pubg-ts'
import config from '../../config'
import { RankedGameModeStats, GameModeStat, PubgDB } from '../../typings'
import PubgStats from '../schemas/PubgStatsSchema'
import { Day } from './DateFormatting'
import Embed from './Embed'

export const playerStats = async (
  nickname: string,
  mode: string,
  interaction: CommandInteraction
) => {
  const pubgUser = await PubgStats.findOne({ nickname: nickname })
  const embed = new Embed(interaction.client, 'success')
  const embedError = new Embed(interaction.client, 'info')
  if (!pubgUser) {
    const buttons = [
      new MessageButton()
        .setLabel('스팀')
        .setCustomId('pubg.steam')
        .setStyle('SECONDARY'),
      new MessageButton()
        .setLabel('카카오')
        .setCustomId('pubg.kakao')
        .setStyle('SECONDARY')
    ]
    embedError.setDescription(
      '처음으로 전적을 검색하는 닉네임 같아요! \n 서버를 선택해 주세요! 다음부터는 선택 없이 검색이 가능해요!'
    )
    embedError.setColor('#2f3136')
    await interaction.editReply({
      embeds: [embedError],
      components: [new MessageActionRow().addComponents(buttons)]
    })
    const collector = interaction.channel?.createMessageComponentCollector({
      time: 30 * 1000
    })
    collector?.on('collect', async (collector_interaction) => {
      if (collector_interaction.customId === 'pubg.kakao') {
        const pubg = new PUBGClient({
          apiKey: config.pubgapikey,
          shard: Shard.KAKAO
        })
        const { data: player } = await pubg.getPlayer({
          skipFailed: false,
          value: nickname
        })
        if (!player || player.length === 0)
          return collector_interaction.reply(
            '유저 정보를 찾지 못했습니다! \n 입력하신 유저의 대소문자 구별하였는지 확인해보세요!'
          )
        const pubgDB = new PubgStats()
        pubgDB.user_id = player[0].id
        pubgDB.nickname = nickname
        pubgDB.platform = Shard.KAKAO
        pubgDB.save((err) => {
          if (err)
            return collector_interaction.reply(
              '데이터 저장도중 오류가 발생했습니다!'
            )
        })
        interaction.editReply({ components: [] })
        collector?.stop()
        return collector_interaction.reply(
          `\`${nickname}\`유저가 \`카카오\` 서버로 설정이 완료되었습니다`
        )
      } else if (collector_interaction.customId === 'pubg.steam') {
        const pubg = new PUBGClient({
          apiKey: config.pubgapikey,
          shard: Shard.STEAM
        })
        const { data: player } = await pubg.getPlayer({
          skipFailed: false,
          value: nickname
        })
        if (!player || player.length === 0)
          return collector_interaction.reply(
            '유저 정보를 찾지 못했습니다! \n 대소문자 구별 필수'
          )
        const pubgDB = new PubgStats()
        pubgDB.user_id = player[0].id
        pubgDB.nickname = nickname
        pubgDB.platform = Shard.STEAM
        pubgDB.save((err) => {
          if (err)
            return collector_interaction.reply(
              '데이터 저장도중 오류가 발생했습니다!'
            )
        })
        interaction.editReply({ components: [] })
        collector?.stop()
        return collector_interaction.reply(
          `\`${nickname}\`유저가 \`스팀\` 서버로 설정이 완료되었습니다`
        )
      } else if (collector_interaction.user.id !== interaction.user.id) {
        collector_interaction.reply(
          `메세지를 작성한 **${interaction.user.username}**만 사용할 수 있습니다.`
        )
      }
    })
  } else {
    const date = new Date()
    if (
      Math.round(Number(date) - Number(pubgUser.last_update)) / 1000 / 60 <
      10
    ) {
      if (mode === 'fpprank') {
        if (!pubgUser.stats.rankSquardFpp)
          return await updateStats(pubgUser, mode, interaction)
        const squadFppStats = pubgUser.stats.rankSquardFpp
        if (!squadFppStats) {
          embed.setDescription(
            `\`${pubgUser.nickname}\`님의 1인칭 스쿼드 경쟁전 전적을 찾을 수 없습니다`
          )
          embed.setColor('#ED4245')
          return interaction.editReply({ embeds: [embed] })
        }
        return interaction.editReply({
          embeds: [
            rankStatEmbed(
              squadFppStats,
              pubgUser.nickname,
              '1인칭 경쟁전',
              pubgUser.last_update
            )
          ]
        })
      } else if (mode === 'tpprank') {
        if (!pubgUser.stats.rankSquardTpp)
          return await updateStats(pubgUser, mode, interaction)
        const squadTppStats = pubgUser.stats.rankSquardTpp
        if (!squadTppStats) {
          embed.setDescription(
            `\`${pubgUser.nickname}\`님의 3인칭 스쿼드 경쟁전 전적을 찾을 수 없습니다`
          )
          embed.setColor('#ED4245')
          return interaction.editReply({ embeds: [embed] })
        }
        return interaction.editReply({
          embeds: [
            rankStatEmbed(
              squadTppStats,
              pubgUser.nickname,
              '3인칭 경쟁전',
              pubgUser.last_update
            )
          ]
        })
      } else if (mode === 'tpp') {
        if (!pubgUser.stats.SquardTpp)
          return await updateStats(pubgUser, mode, interaction)
        const squadTppStats: GameModeStat = pubgUser.stats.SquardTpp
        if (!squadTppStats) {
          embed.setDescription(
            `\`${pubgUser.nickname}\`님의 3인칭 스쿼드 전적을 찾을 수 없습니다`
          )
          embed.setColor('#ED4245')
          return interaction.editReply({ embeds: [embed] })
        }
        return interaction.editReply({
          embeds: [
            statEmbed(
              squadTppStats,
              pubgUser.nickname,
              '3인칭 일반전',
              pubgUser.last_update
            )
          ]
        })
      } else if (mode == 'fpp') {
        if (!pubgUser.stats.SquardFpp)
          return await updateStats(pubgUser, mode, interaction)
        const squadFppStats = pubgUser.stats.SquardFpp
        if (!squadFppStats) {
          embed.setDescription(
            `\`${pubgUser.nickname}\`님의 1인칭 스쿼드 전적을 찾을 수 없습니다`
          )
          embed.setColor('#ED4245')
          return interaction.editReply({ embeds: [embed] })
        }
        return interaction.editReply({
          embeds: [
            statEmbed(
              squadFppStats,
              pubgUser.nickname,
              '1인칭 일반전',
              pubgUser.last_update
            )
          ]
        })
      }
    } else {
      return await updateStats(pubgUser, mode, interaction)
    }
  }

  async function updateStats(
    pubgUser: PubgDB,
    mode: string,
    interaction: CommandInteraction
  ) {
    const embed = new Embed(interaction.client, 'success')
    if (mode === 'fpprank') {
      const pubg = new PUBGClient({
        apiKey: config.pubgapikey,
        shard: pubgUser.platform as Shard
      })
      const { data: activeSeason } = await pubg.getSeason()
      const { data: SeasonsStats, error: error } = await pubg.getPlayerSeason({
        player: pubgUser.user_id,
        season: activeSeason as Season,
        ranked: true,
        gamemode: GameModeStatGamemode.SQUAD_FPP
      })
      if (error) {
        console.log(error)
      }
      const squadFppStats: RankedGameModeStats =
        // @ts-ignore
        SeasonsStats.rankedGameModeStats['squad-fpp']

      await PubgStats.updateOne(
        { user_id: pubgUser.user_id },
        {
          $set: {
            stats: {
              // @ts-ignore
              rankSquardTpp: SeasonsStats.rankedGameModeStats.squad,
              // @ts-ignore
              rankSquardFpp: SeasonsStats.rankedGameModeStats['squad-fpp']
            },
            last_update: new Date()
          }
        }
      )
      return interaction.editReply({
        embeds: [
          rankStatEmbed(
            squadFppStats,
            pubgUser.nickname,
            '1인칭 경쟁전',
            new Date()
          )
        ]
      })
    } else if (mode === 'tpprank') {
      const pubg = new PUBGClient({
        apiKey: config.pubgapikey,
        shard: pubgUser.platform as Shard
      })
      const { data: activeSeason } = await pubg.getSeason()
      const { data: SeasonsStats, error: error } = await pubg.getPlayerSeason({
        player: pubgUser.user_id,
        season: activeSeason as Season,
        ranked: true,
        gamemode: GameModeStatGamemode.SQUAD
      })
      if (error) {
        console.log(error)
      }
      const squadTppStats: RankedGameModeStats =
        // @ts-ignore
        SeasonsStats.rankedGameModeStats.squad
      await PubgStats.updateOne(
        { user_id: pubgUser.user_id },
        {
          $set: {
            stats: {
              // @ts-ignore
              rankSquardTpp: SeasonsStats.rankedGameModeStats.squad,
              // @ts-ignore
              rankSquardFpp: SeasonsStats.rankedGameModeStats['squad-fpp']
            },
            last_update: new Date()
          }
        }
      )
      if (!squadTppStats) {
        embed.setDescription(
          `\`${pubgUser.nickname}\`님의 3인칭 스쿼드 전적을 찾을 수 없습니다`
        )
        embed.setColor('#ED4245')
        return interaction.editReply({ embeds: [embed] })
      }
      return interaction.editReply({
        embeds: [
          rankStatEmbed(
            squadTppStats,
            pubgUser.nickname,
            '3인칭 경쟁전',
            new Date()
          )
        ]
      })
    } else if (mode === 'tpp') {
      const pubg = new PUBGClient({
        apiKey: config.pubgapikey,
        shard: pubgUser.platform as Shard
      })
      const { data: activeSeason } = await pubg.getSeason()
      const { data: SeasonsStats, error: error } = await pubg.getPlayerSeason({
        player: pubgUser.user_id,
        season: activeSeason as Season,
        gamemode: GameModeStatGamemode.SQUAD
      })
      if (error) {
        console.log(error)
      }
      // @ts-ignore
      const squadTppStats: GameModeStat = SeasonsStats.gamemodeStats.squad
      await PubgStats.updateOne(
        { user_id: pubgUser.user_id },
        {
          $set: {
            stats: {
              // @ts-ignore
              SquardTpp: SeasonsStats.gamemodeStats.squad,
              // @ts-ignore
              SquardFpp: SeasonsStats.gamemodeStats['squad-fpp']
            },
            last_update: new Date()
          }
        }
      )
      if (!squadTppStats) {
        embed.setDescription(
          `\`${pubgUser.nickname}\`님의 3인칭 스쿼드 전적을 찾을 수 없습니다`
        )
        embed.setColor('#ED4245')
        return interaction.editReply({ embeds: [embed] })
      }
      return interaction.editReply({
        embeds: [
          statEmbed(
            squadTppStats,
            pubgUser.nickname,
            '3인칭 일반전',
            new Date()
          )
        ]
      })
    } else if (mode == 'fpp') {
      const pubg = new PUBGClient({
        apiKey: config.pubgapikey,
        shard: pubgUser.platform as Shard
      })
      const { data: activeSeason } = await pubg.getSeason()
      const { data: SeasonsStats, error: error } = await pubg.getPlayerSeason({
        player: pubgUser.user_id,
        season: activeSeason as Season,
        gamemode: GameModeStatGamemode.SQUAD_FPP
      })
      const squadFppStats: GameModeStat =
        // @ts-ignore
        SeasonsStats.gamemodeStats['squad-fpp']
      await PubgStats.updateOne(
        { user_id: pubgUser.user_id },
        {
          $set: {
            stats: {
              // @ts-ignore
              SquardTpp: SeasonsStats.gamemodeStats.squad,
              // @ts-ignore
              SquardFpp: SeasonsStats.gamemodeStats['squad-fpp']
            },
            last_update: new Date()
          }
        }
      )
      if (!squadFppStats) {
        embed.setDescription(
          `\`${pubgUser.nickname}\`님의 1인칭 스쿼드 전적을 찾을 수 없습니다`
        )
        embed.setColor('#ED4245')
        return interaction.editReply({ embeds: [embed] })
      }
      return interaction.editReply({
        embeds: [
          statEmbed(
            squadFppStats,
            pubgUser.nickname,
            '1인칭 일반전',
            new Date()
          )
        ]
      })
    }
  }
}

const rankStatEmbed = (
  stats: RankedGameModeStats,
  nickname: string,
  mode: string,
  last_update: Date
) => {
  const embed = new MessageEmbed()
  if (!stats) {
    embed
      .setDescription(
        `\`${nickname}\`님의 ${mode} 스쿼드 전적을 찾을 수 없습니다`
      )
    embed.setColor('#ED4245')
      .setFooter(`마지막 업데이트: ${Day(last_update).fromNow(false)}`)
    return embed
  }
  embed
    .setColor('#2f3136')
    .setAuthor(`${nickname}님의 ${mode} 전적`)
    .setTitle(
      stats.currentTier
        ? `${stats.currentTier.tier} ${stats.currentTier.subTier}`
        : '언랭크'
    )
    .setThumbnail(
      `https://dak.gg/pubg/images/tiers/s7/rankicon_${
        stats.currentTier.tier.toLowerCase() + stats.currentTier.subTier
      }.png`
    )
    .addField('KDA', stats.kda.toFixed(2), true)
    .addField('승률', (stats.winRatio * 100).toFixed(1) + '%', true)
    .addField('TOP 10', (stats.top10Ratio * 100).toFixed(1) + '%', true)
    .addField(
      '평균 딜량',
      (stats.damageDealt / stats.roundsPlayed).toFixed(0),
      true
    )
    .addField('게임 수', stats.roundsPlayed.toString(), true)
    .addField('평균 등수', stats.avgRank.toFixed(1) + '등', true)
    .setFooter(`마지막 업데이트: ${Day(last_update).fromNow(false)}`)
  return embed
}

const statEmbed = (
  stats: GameModeStat,
  nickname: string,
  mode: string,
  last_update: Date
) => {
  const winGamePercent = (stats.wins / stats.roundsPlayed) * 100
  const top10GamePercent = (stats.top10s / stats.roundsPlayed) * 100
  const embed = new MessageEmbed()
    .setColor('#2f3136')
    .setAuthor(`${nickname}님의 ${mode} 전적`)
    .addField(
      'KDA',
      ((stats.kills + stats.assists) / stats.losses).toFixed(2),
      true
    )
    .addField('승률', winGamePercent.toFixed(1) + '%', true)
    .addField('TOP 10', top10GamePercent.toFixed(1) + '%', true)
    .addField(
      '평균 딜량',
      (stats.damageDealt / stats.roundsPlayed).toFixed(0),
      true
    )
    .addField('게임 수', stats.roundsPlayed.toString(), true)
    .addField('최다 킬', stats.roundMostKills + '킬', true)
    .setFooter(`마지막 업데이트: ${Day(last_update).fromNow(false)}`)
  return embed
}
