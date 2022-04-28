import { BaseCommand, SlashCommand } from '../../structures/Command'
import musicDB from '../../schemas/musicSchema'
import Embed from '../../utils/Embed'
import MusicEmbed from '../../utils/MusicEmbed'
import { MessageActionRow, MessageButton } from 'discord.js'
import { channelMention, SlashCommandBuilder } from '@discordjs/builders'
import { buttonList } from '../../utils/musicbutton'
import config from '../../../config'

export default new BaseCommand(
  {
    name: 'musicsettingdelete',
    description: '노래 기능 세팅을 해제합니다',
    aliases: ['뮤직설정해제', '노래세팅해제', 'musicsetdel']
  },
  async (client, message, args) => {
    let errembed = new Embed(client, 'error')
    let sucessembed = new Embed(client, 'success')
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
      errembed.setTitle('이런...!')
      errembed.setDescription(`음악 기능을 설정한 기록이 없는거같아요! \n \`${config.bot.prefix}뮤직세팅\` 을 입력해주세요!`)
      return message.reply({embeds: [errembed]})
    } else {
      await musicDB.deleteOne({guild_id: message.guild.id})
      sucessembed.setTitle('설정을 성공적으로 해제 했어요!')
      return message.reply({embeds: [sucessembed]})
    }
  },
  {
    data: new SlashCommandBuilder()
    .setName('뮤직설정해제')
    .setDescription('설정하신 뮤직 기능을 해제합니다!'),
    options: {
      name: '뮤직설정해제',
      isSlash: true
    },
    async execute(client, interaction) {
      await interaction.deferReply()
      let errembed = new Embed(client, 'error')
      let sucessembed = new Embed(client, 'success')
      if(!interaction.guild) {
        errembed.setTitle('이 명령어는 서버에서만 사용이 가능해요!')
        return interaction.editReply({embeds: [errembed]})
      }
      if(!interaction.guild.members.cache.get(interaction.user.id)?.permissions.has('MANAGE_CHANNELS')) {
        errembed.setTitle('이 명령어를 사용할 권한이 없어요')
        return interaction.editReply({embeds: [errembed]})
      }
      let db = await musicDB.findOne({guild_id: interaction.guild.id})
      if(!db) {
        errembed.setTitle('이런...!')
        errembed.setDescription(`음악 기능을 설정한 기록이 없는거같아요! \n \`/뮤직세팅\` 을 입력해주세요!`)
        return interaction.editReply({embeds: [errembed]})
      } else {
        await musicDB.deleteOne({guild_id: interaction.guild.id})
        sucessembed.setTitle('설정을 성공적으로 해제 했어요!')
        return interaction.editReply({embeds: [sucessembed]})
      }
    }
  }
)

