import { CommandInteraction, MessageActionRow, MessageButton, MessageEmbed } from "discord.js";
import { Client as PUBGClient, GameModeStatGamemode, Season, Shard } from "pubg.ts";
import config from "../../config";
import { RankedGameModeStats, GameModeStat, PubgDB } from "../../typings";
import PubgStats from "../schemas/PubgStatsSchema";
import { Day } from "./DateFormatting";
import Embed from "./Embed";

export const playerStats = async(nickname: string, mode: string, interaction: CommandInteraction) => {
  let pubgUser = await PubgStats.findOne({nickname: nickname})
  let embed = new Embed(interaction.client, 'success')
  let embedError = new Embed(interaction.client, 'info')
  if(!pubgUser) {
    let buttons = [
      new MessageButton()
        .setLabel('스팀')
        .setCustomId('pubg.steam')
        .setStyle('SECONDARY'),
      new MessageButton()
        .setLabel('카카오')
        .setCustomId('pubg.kakao')
        .setStyle('SECONDARY')
    ]
    embedError.setDescription('처음으로 전적을 검색하는 닉네임 같아요! \n 서버를 선택해 주세요! 다음부터는 선택 없이 검색이 가능해요!')
    await interaction.editReply({embeds: [embedError], components: [new MessageActionRow().addComponents(buttons)]})
    let collector = interaction.channel?.createMessageComponentCollector({
      time: 30 * 1000
    })  
    collector?.on('collect', async (collector_interaction) => {
      if (collector_interaction.customId === 'pubg.kakao') {
        let pubg = new PUBGClient({apiKey: config.pubgapikey, shard: Shard.KAKAO})
        let { data: player } = await pubg.getPlayer({skipFailed: false, value: nickname})
        if(!player || player.length === 0) return collector_interaction.reply('유저 정보를 찾지 못했습니다! \n 대소문자 구별 필수')
        let pubgDB = new PubgStats
        pubgDB.user_id = player[0].id
        pubgDB.nickname = nickname
        pubgDB.platform = Shard.KAKAO
        pubgDB.save((err) => {
          if(err) return collector_interaction.reply('데이터 저장도중 오류가 발생했습니다!')
        })
        interaction.editReply({components: []})
        collector?.stop()
        return collector_interaction.reply(`\`${nickname}\`유저가 \`카카오\` 서버로 설정이 완료되었습니다`)
      } else if (collector_interaction.customId === 'pubg.steam') {
        let pubg = new PUBGClient({apiKey: config.pubgapikey, shard: Shard.STEAM})
        let { data: player } = await pubg.getPlayer({skipFailed: false, value: nickname})
        if(!player || player.length === 0) return collector_interaction.reply('유저 정보를 찾지 못했습니다! \n 대소문자 구별 필수')
        let pubgDB = new PubgStats
        pubgDB.user_id = player[0].id
        pubgDB.nickname = nickname
        pubgDB.platform = Shard.STEAM
        pubgDB.save((err) => {
          if(err) return collector_interaction.reply('데이터 저장도중 오류가 발생했습니다!')
        })
        interaction.editReply({components: []})
        collector?.stop()
        return collector_interaction.reply(`\`${nickname}\`유저가 \`스팀\` 서버로 설정이 완료되었습니다`)
      } else if (collector_interaction.user.id !== interaction.user.id) {
        collector_interaction.reply(
          `메세지를 작성한 **${interaction.user.username}**만 사용할 수 있습니다.`
        )
      }
    })
  } else {
    let date = new Date()
    if((Math.round(Number(date) - (Number(pubgUser.last_update))) / 1000 / 60) < 10) {
      if(!pubgUser.stats) {
        await updateStats(pubgUser, mode, interaction)
      } else {
        if(mode === 'fpprank') {
          let squadFppStats = pubgUser.stats.rankSquardFpp
          if(!squadFppStats) {
            embed.setDescription(`\`${pubgUser.nickname}\`님의 1인칭 스쿼드 경쟁전 전적을 찾을 수 없습니다`)
            return interaction.editReply({embeds: [embed]})
          }
          return interaction.editReply({embeds: [rankStatEmbed(squadFppStats, pubgUser.nickname, '1인칭 경쟁전', pubgUser.last_update)]})
        } else if(mode === 'tpprank') {
          let squadTppStats = pubgUser.stats.rankSquardTpp
          if(!squadTppStats) {
            embed.setDescription(`\`${pubgUser.nickname}\`님의 3인칭 스쿼드 경쟁전 전적을 찾을 수 없습니다`)
            return interaction.editReply({embeds: [embed]})
          }
          return interaction.editReply({embeds: [rankStatEmbed(squadTppStats, pubgUser.nickname, '3인칭 경쟁전', pubgUser.last_update)]})
        } else if(mode === 'tpp') {
          let squadTppStats: GameModeStat = pubgUser.stats.SquardTpp
          if(!squadTppStats) {
            embed.setDescription(`\`${pubgUser.nickname}\`님의 3인칭 스쿼드 전적을 찾을 수 없습니다`)
            return interaction.editReply({embeds: [embed]})
          }
          return interaction.editReply({embeds: [statEmbed(squadTppStats, pubgUser.nickname, '3인칭 일반전', pubgUser.last_update)]})
        } else if (mode == 'fpp') {
          let squadFppStats = pubgUser.stats.SquardFpp
          if(!squadFppStats) {
            embed.setDescription(`\`${pubgUser.nickname}\`님의 1인칭 스쿼드 전적을 찾을 수 없습니다`)
            return interaction.editReply({embeds: [embed]})
          }
          return interaction.editReply({embeds: [statEmbed(squadFppStats, pubgUser.nickname, '1인칭 일반전', pubgUser.last_update)]})
        }
      }
    } else {
    await updateStats(pubgUser, mode, interaction)
  }
}

async function updateStats(pubgUser: PubgDB, mode: string, interaction: CommandInteraction) {
  let embed = new Embed(interaction.client, 'success')
  if(mode === 'fpprank') {
    let pubg = new PUBGClient({apiKey: config.pubgapikey, shard: pubgUser.platform as Shard})
    let { data: activeSeason } = await pubg.getSeason();
    let { data: SeasonsStats, error: error } = await pubg.getPlayerSeason({
      player: pubgUser.user_id,
      season: activeSeason as Season,
      ranked: true,
      gamemode: GameModeStatGamemode.SQUAD_FPP
    })
    if(error) {
      console.log(error)
    }
    // @ts-ignore
    let squadFppStats: RankedGameModeStats = SeasonsStats.rankedGameModeStats['squad-fpp']
    // @ts-ignore
    await PubgStats.updateOne({user_id: pubgUser.user_id}, {$set: {stats: {rankSquardTpp: SeasonsStats.rankedGameModeStats.squad, rankSquardFpp: SeasonsStats.rankedGameModeStats['squad-fpp']}, last_update: new Date()}})
    return interaction.editReply({embeds: [rankStatEmbed(squadFppStats, pubgUser.nickname, '1인칭 경쟁전', new Date())]})
  } else if (mode === 'tpprank') {
    let pubg = new PUBGClient({apiKey: config.pubgapikey, shard: pubgUser.platform as Shard})
    let { data: activeSeason } = await pubg.getSeason();
    let { data: SeasonsStats, error: error } = await pubg.getPlayerSeason({
      player: pubgUser.user_id,
      season: activeSeason as Season,
      ranked: true,
      gamemode: GameModeStatGamemode.SQUAD
    })
    if(error) {
      console.log(error)
    }
    // @ts-ignore
    let squadTppStats: RankedGameModeStats = SeasonsStats.rankedGameModeStats.squad
    // @ts-ignore
    await PubgStats.updateOne({user_id: pubgUser.user_id}, {$set: {stats: {rankSquardTpp: SeasonsStats.rankedGameModeStats.squad, rankSquardFpp: SeasonsStats.rankedGameModeStats['squad-fpp']}, last_update: new Date()}})
    if(!squadTppStats) {
      embed.setDescription(`\`${pubgUser.nickname}\`님의 3인칭 스쿼드 전적을 찾을 수 없습니다`)
      return interaction.editReply({embeds: [embed]})
    }
    return interaction.editReply({embeds: [rankStatEmbed(squadTppStats, pubgUser.nickname, '3인칭 경쟁전', new Date())]})
  } else if (mode === 'tpp') {
    let pubg = new PUBGClient({apiKey: config.pubgapikey, shard: pubgUser.platform as Shard})
    let { data: activeSeason } = await pubg.getSeason();
    let { data: SeasonsStats, error: error } = await pubg.getPlayerSeason({
      player: pubgUser.user_id,
      season: activeSeason as Season,
      gamemode: GameModeStatGamemode.SQUAD
    })
    if(error) {
      console.log(error)
    }
    // @ts-ignore
    let squadTppStats: GameModeStat = SeasonsStats.gamemodeStats.squad
    // @ts-ignore
    await PubgStats.updateOne({user_id: pubgUser.user_id}, {$set: {stats: {SquardTpp: SeasonsStats.gamemodeStats.squad, SquardFpp: SeasonsStats.gamemodeStats['squad-fpp']}, last_update: new Date()}})
    if(!squadTppStats) {
      embed.setDescription(`\`${pubgUser.nickname}\`님의 3인칭 스쿼드 전적을 찾을 수 없습니다`)
      return interaction.editReply({embeds: [embed]})
    }
    return interaction.editReply({embeds: [statEmbed(squadTppStats, pubgUser.nickname, '3인칭 일반전', new Date())]})
  } else if (mode == 'fpp') {
    let pubg = new PUBGClient({apiKey: config.pubgapikey, shard: pubgUser.platform as Shard})
    let { data: activeSeason } = await pubg.getSeason();
    let { data: SeasonsStats, error: error } = await pubg.getPlayerSeason({
      player: pubgUser.user_id,
      season: activeSeason as Season,
      gamemode: GameModeStatGamemode.SQUAD_FPP
    })
    // @ts-ignore
    let squadFppStats: GameModeStat = SeasonsStats.gamemodeStats['squad-fpp']
    // @ts-ignore
    await PubgStats.updateOne({user_id: pubgUser.user_id}, {$set: {stats: {SquardTpp: SeasonsStats.gamemodeStats.squad, SquardFpp: SeasonsStats.gamemodeStats['squad-fpp']}, last_update: new Date()}})
    if(!squadFppStats) {
      embed.setDescription(`\`${pubgUser.nickname}\`님의 1인칭 스쿼드 전적을 찾을 수 없습니다`)
      return interaction.editReply({embeds: [embed]})
    }
    return interaction.editReply({embeds: [statEmbed(squadFppStats, pubgUser.nickname, '1인칭 일반전', new Date())]})
  }
}
}

const rankStatEmbed = (stats: RankedGameModeStats, nickname: string, mode: string, last_update: Date) => {
  let embed = new MessageEmbed()
    .setColor('BLUE')
    .setAuthor(`${nickname}님의 ${mode} 전적`)
    .setTitle(`${stats.currentTier.tier} ${stats.currentTier.subTier}`)
    .setThumbnail(`https://dak.gg/pubg/images/tiers/s7/rankicon_${stats.currentTier.tier.toLowerCase() + stats.currentTier.subTier}.png`)
    .addField('KDA', stats.kda.toFixed(2), true)
    .addField('승률', (stats.winRatio * 100).toFixed(1)+"%", true)
    .addField('TOP 10', (stats.top10Ratio * 100).toFixed(1)+"%", true)
    .addField('평균 딜량', (stats.damageDealt/stats.roundsPlayed).toFixed(0), true)
    .addField('게임 수', stats.roundsPlayed.toString(), true)
    .addField('평균 등수', stats.avgRank.toFixed(1) + "등", true)
    .setFooter(`마지막 업데이트: ${Day(last_update).fromNow(false)}`)
  return embed
}

const statEmbed = (stats: GameModeStat, nickname: string, mode: string,  last_update: Date) => {
  let winGamePercent = (stats.wins/stats.roundsPlayed * 100);
  let top10GamePercent = (stats.top10s/stats.roundsPlayed * 100);
  let embed = new MessageEmbed()
    .setColor('BLUE')
    .setAuthor(`${nickname}님의 ${mode} 전적`)
    .addField('KDA', ((stats.kills + stats.assists) / stats.losses).toFixed(2), true)
    .addField('승률', winGamePercent.toFixed(1) + "%", true)
    .addField('TOP 10', top10GamePercent.toFixed(1) + "%", true)
    .addField('평균 딜량', (stats.damageDealt/stats.roundsPlayed).toFixed(0), true)
    .addField('게임 수', stats.roundsPlayed.toString(), true)
    .addField('최다 킬', stats.roundMostKills + "킬", true)
    .setFooter(`마지막 업데이트: ${Day(last_update).fromNow(false)}`)
  return embed
}