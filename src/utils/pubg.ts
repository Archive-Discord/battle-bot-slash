import { CommandInteraction, MessageActionRow, MessageButton } from "discord.js";
import { Client as PUBGClient, Season, Shard } from "pubg.ts";
import config from "../../config";
import { pubgPlatformeType, RankedGameModeStats, GameModeStat } from "../../typings";
import PubgStats from "../schemas/PubgStatsSchema";
import Embed from "./Embed";

export const playerStats = async(nickname: string, mode: string, interaction: CommandInteraction) => {
  const pubgUser = await PubgStats.findOne({nickname: nickname})
  const embed = new Embed(interaction.client, 'success')
  const embedError = new Embed(interaction.client, 'info')
  if(!pubgUser) {
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
    embedError.setDescription('처음으로 전적을 검색하는 닉네임 같아요! \n 서버를 검색해 주세요! 다음부터는 선택 없이 검색이 가능해요!')
    await interaction.editReply({embeds: [embedError], components: [new MessageActionRow().addComponents(buttons)]})
    const collector = interaction.channel?.createMessageComponentCollector({
      time: 30 * 1000
    })
    collector?.on('collect', async (collector_interaction) => {
      if (collector_interaction.customId === 'pubg.kakao') {
        const pubg = new PUBGClient({apiKey: config.pubgapikey, shard: Shard.KAKAO})
        const { data: player } = await pubg.getPlayer({skipFailed: false, value: nickname})
        if(!player || player.length === 0) return collector_interaction.reply('유저 정보를 찾지 못했습니다! \n 대소문자 구별 필수')
        const pubgDB = new PubgStats
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
        const pubg = new PUBGClient({apiKey: config.pubgapikey, shard: Shard.STEAM})
        const { data: player } = await pubg.getPlayer({skipFailed: false, value: nickname})
        if(!player || player.length === 0) return collector_interaction.reply('유저 정보를 찾지 못했습니다! \n 대소문자 구별 필수')
        const pubgDB = new PubgStats
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
    const date = new Date()
    if((Math.round(Number(date) - (Number(pubgUser.last_update))) / 1000 / 60) < 10) {
      if(!pubgUser.stats) {
        const pubg = new PUBGClient({apiKey: config.pubgapikey, shard: pubgUser.platform as Shard})
        const { data: activeSeason } = await pubg.getSeason();
        console.log(activeSeason)
      } else {
        const pubg = new PUBGClient({apiKey: config.pubgapikey, shard: pubgUser.platform as Shard})
        const { data: activeSeason } = await pubg.getSeason();
        console.log(activeSeason)
      }
    } else {
      const pubg = new PUBGClient({apiKey: config.pubgapikey, shard: pubgUser.platform as Shard})
      const {data: activeSeason } = await pubg.getSeason({id: "division.bro.official.console-16"});
      if(mode === 'fpprank') {
        const { data: playerSeason } = await pubg.getPlayerSeason({
          player: pubgUser.user_id,
          // @ts-ignore
          season: activeSeason,
          ranked: true
        });
        console.log(playerSeason)
      }
    }
  }
}