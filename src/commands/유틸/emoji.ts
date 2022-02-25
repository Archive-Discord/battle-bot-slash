import { BaseCommand, SlashCommand } from '../../structures/Command'
import UserDB from '../../schemas/userSchema'
import Embed from '../../utils/Embed'
import { SlashCommandBuilder, userMention } from '@discordjs/builders'
import DateFormatting from '../../utils/DateFormatting'

export default new BaseCommand(
  {
    name: 'emoji',
    description: '이모지를 확대합니다',
    aliases: ['이모지', 'dlahwl', 'emoji']
  },
  async (client, message, args) => {
    let errEmbed = new Embed(client, 'error')
    let successEmbed = new Embed(client, 'success')
    if(!message.guild) {
      errEmbed.setDescription('이 명령어는 서버에서만 사용 가능합니다')
      return message.reply({embeds: [errEmbed]})
    }

    if(!/(<a?)?:\w+:(\d{18}>)?/g.test(args[0])){
      errEmbed.setDescription('이모지만 입력해주세요')
      return message.reply({embeds: [errEmbed]})
    }
    let emoji = client.emojis.cache.get(args[0].split(':')[2].replace(/[^0-9]/g,''))
    if(!emoji) {
      errEmbed.setDescription('찾을 수 없는 이모지입니다!')
      return message.reply({embeds: [errEmbed]})
    }
    successEmbed
      .setTitle("이모지")
      .setImage(emoji.url)
    return message.reply({embeds: [successEmbed]})
  },
  {
    data: new SlashCommandBuilder()
    .setName('이모지')
    .addStringOption(option =>
      option
        .setName("이모지")
        .setDescription("확인할 이모지를 입력해주세요")
        .setRequired(true)
    )
    .setDescription('이모지의 정보를 불러옵니다'),
    options: {
      name: '이모지',
      isSlash: true
    },
    async execute(client, interaction) {
      await interaction.deferReply()
      let errEmbed = new Embed(client, 'error')
      let successEmbed = new Embed(client, 'success')
      let stringemoji = interaction.options.getString('이모지', true)
      if(!interaction.guild) {
        errEmbed.setDescription('이 명령어는 서버에서만 사용 가능합니다')
        return interaction.editReply({embeds: [errEmbed]})
      }

      if(!/(<a?)?:\w+:(\d{18}>)?/g.test(stringemoji)){
        errEmbed.setDescription('이모지만 입력해주세요')
        return interaction.editReply({embeds: [errEmbed]})
      }
      let emoji = client.emojis.cache.get(stringemoji.split(':')[2].replace(/[^0-9]/g,''))
      if(!emoji) {
        errEmbed.setDescription('찾을 수 없는 이모지입니다!')
        return interaction.editReply({embeds: [errEmbed]})
      }
      successEmbed
        .setTitle("이모지")
        .setImage(emoji.url)
      return interaction.editReply({embeds: [successEmbed]})
      }
  }
)

