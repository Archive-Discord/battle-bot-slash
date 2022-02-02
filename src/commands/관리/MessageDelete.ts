import BotClient from "@client"
import { Message } from "discord.js"

import { SlashCommandBuilder } from '@discordjs/builders'
import Discord from 'discord.js'
import Embed from '../../utils/Embed'

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
<<<<<<< HEAD:src/commands/관리/MessageDelete.ts
  async execute(client: BotClient, message: Message, args: string[] | number[]) {
    if (message.channel.type === 'DM') return message.reply('DM에서 사용할 수 없는 명령어입니다')

=======
  async execute(client, message, args) {
    if(!args[0]) return message.reply('삭제할 메시지의 번호를 입력해주세요')
>>>>>>> origin/master:src/commands/관리/MessageDelete.js
    let number = Number(args[0])
    if (typeof number !== 'number')
      return message.reply('삭제할 메시지의 번호를 입력해주세요')

    if (number <= 100) {
      message.delete()
      message.channel.bulkDelete(args[0] as number)
    } else {
      let fetched = await message.channel.messages.fetch({ limit: number })

      try {
        message.channel.bulkDelete(fetched)
      } finally {
        message.channel.send(`${args[0]} 개의 메시지를 삭제했습니다`)
      }
    }
  }
}