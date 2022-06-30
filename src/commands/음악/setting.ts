import { BaseCommand, SlashCommand } from '../../structures/Command'
import musicDB from '../../schemas/musicSchema'
import Embed from '../../utils/Embed'
import MusicEmbed from '../../utils/MusicEmbed'
import { GuildMember, MessageActionRow, MessageButton, Constants, TextChannel, MessageEmbed } from 'discord.js'
import { channelMention, SlashCommandBuilder } from '@discordjs/builders'
import { buttonList } from '../../utils/musicbutton'
import config from '../../../config'
import progressbar from "string-progressbar"

export default new BaseCommand(
  {
    name: 'musicsetting',
    description: '노래 기능을 세팅합니다',
    aliases: ['뮤직세팅', '노래세팅', 'musicset', '음악세팅']
  },
  async (client, message, args) => {
    let errembed = new Embed(client, 'error')
      .setColor('#2f3136')
    let musicEmbed = new MusicEmbed(client)
    if(!message.guild) {
      errembed.setTitle('이 명령어는 서버에서만 사용이 가능해요!')
      return message.reply({embeds: [errembed]})
    }
    if(!message.member?.permissions.has("MANAGE_CHANNELS")) {
      errembed.setTitle('이 명령어를 사용할 권한이 없어요')
      return message.reply({embeds: [errembed]})
    }
    let db = await musicDB.findOne({guild_id: message.guild.id})
    if(!db) {
      let musicChannel = await message.guild.channels.create('battle-bot-music', {type: "GUILD_TEXT"})
      const row = new MessageActionRow()
        .addComponents(buttonList)
      let msg = await musicChannel.send({embeds: [musicEmbed], components: [row]})
      let musicdb = new musicDB()
      musicdb.guild_id = message.guild.id
      musicdb.channel_id = musicChannel.id
      musicdb.message_id = msg.id
      musicdb.save((err: any) => {
        if(err) {
          errembed.setTitle('뮤직기능 설정중 오류가 발생했어요!')
          return message.reply({embeds: [errembed]})
        }
      })
      return message.reply(`${channelMention(musicChannel.id)} 노래기능 설정이 완료되었어요!`)
    } else {
      errembed.setTitle('이런...!')
      errembed.setDescription(`이미 ${channelMention(db.channel_id)}로 음악기능이 설정되있는거 같아요! \n 채널을 삭제하셨거나 다시 설정을 원하시면 \`${config.bot.prefix}뮤직설정헤제\` 입력 후 다시 시도해주세요!`)
      return message.reply({embeds: [errembed]})
    }
  }, {
    data: new SlashCommandBuilder()
    .setName('뮤직세팅')
    .setDescription('뮤직 기능을 설정합니다!'),
    options: {
      name: '뮤직세팅',
      isSlash: true
    },
    async execute(client, interaction) {
      await interaction.deferReply({ ephemeral: true })
      let errembed = new Embed(client, 'error')
        .setColor('#2f3136')
      let musicEmbed = new MusicEmbed(client)
      if(!interaction.guild) {
        errembed.setTitle('이 명령어는 서버에서만 사용이 가능해요!')
        return interaction.editReply({embeds: [errembed]})
      }
      let member = interaction.guild.members.cache.get(interaction.user.id)
      if(!member) member = await interaction.guild.members.fetch(interaction.user.id) as GuildMember
      if(!member.permissions.has("MANAGE_CHANNELS")) {
        errembed.setTitle('이 명령어를 사용할 권한이 없어요')
        return interaction.editReply({embeds: [errembed]})
      }
      let db = await musicDB.findOne({guild_id: interaction.guild.id})
      if(!db) {
        let musicChannel = await interaction.guild.channels.create('battle-bot-music', {type: "GUILD_TEXT"})
        const row = new MessageActionRow()
          .addComponents(buttonList)
        let msg = await musicChannel.send({embeds: [musicEmbed], components: [row]})
        let musicdb = new musicDB()
        musicdb.guild_id = interaction.guild.id
        musicdb.channel_id = musicChannel.id
        musicdb.message_id = msg.id
        musicdb.save((err: any) => {
          if(err) {
            errembed.setTitle('뮤직기능 설정중 오류가 발생했어요!')
            return interaction.editReply({embeds: [errembed]})
          }
        })
        return interaction.editReply(`${channelMention(musicChannel.id)} 노래기능 설정이 완료되었어요!`)
      } else {
        errembed.setTitle('이런...!')
        errembed.setDescription(`이미 ${channelMention(db.channel_id)}로 음악기능이 설정되있는거 같아요! \n 채널을 삭제하셨거나 다시 설정을 원하시면 \`${config.bot.prefix}뮤직설정헤제\` 입력 후 다시 시도해주세요!`)
        return interaction.editReply({embeds: [errembed]})
      }
    }
  }
)

