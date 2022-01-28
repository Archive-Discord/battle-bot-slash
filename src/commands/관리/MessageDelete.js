const { SlashCommandBuilder } = require('@discordjs/builders')
const Discord = require('discord.js')
const Embed = require('../../utils/Embed')

export default {
  name: 'clear',
  description: '메시지를 삭제합니다',
  aliases: ['청소', '삭제', 'delmsg', '클리어', 'cjdth'],
  isSlash: false,
  /**
   * @param {import('../../structures/BotClient')} client 
   * @param {Discord.Message} message 
   * @param {string[]} args 
   */
  async execute(client, message, args) {
    let number = Number(args[0])
    if(typeof number !== 'number')
      return message.reply('삭제할 메시지의 번호를 입력해주세요')
    
    if(number <= 100) {
      message.delete()
      message.channel.bulkDelete(args[0])
    } else {
      let fetched = await message.channel.messages.fetch({ limit: number })

      try {
        message.channel.bulkDelete(fetched)
      } finally {
        message.channel.send('asdf')
      }
    }
  }
}