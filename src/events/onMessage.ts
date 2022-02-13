import { Event } from '../structures/Event'
import CommandManager from '../managers/CommandManager'
import ErrorManager from '../managers/ErrorManager'
import { MessageCommand } from '../structures/Command'
import BotClient from '../structures/BotClient'
import { Message } from 'discord.js'
import Automod from '../schemas/autoModSchema'
import profanitys from '../contents/profanitys'
import axios from 'axios'
import { AutoModDB } from '../../typings'

export default new Event('messageCreate', async (client, message) => {
  const commandManager = new CommandManager(client)
  const errorManager = new ErrorManager(client)

  if (message.author.bot) return
  if (message.channel.type === 'DM') return
   profanityFilter(client, message)
  if (!message.content.startsWith(client.config.bot.prefix)) return

  const args = message.content
    .slice(client.config.bot.prefix.length)
    .trim()
    .split(/ +/g)
  const commandName = args.shift()?.toLowerCase()
  const command = commandManager.get(commandName as string) as MessageCommand

  await client.dokdo.run(message)
  try {
    await command?.execute(client, message, args)
  } catch (error: any) {
    errorManager.report(error, { executer: message, isSend: true })
  }
})


const profanityFilter = async(client: BotClient, message: Message) => {
  if(!message.content) return
  const automodDB = await Automod.findOne({guild_id: message.guild?.id})
  if(!automodDB) return
  if(!automodDB.useing.useCurse) return
  if(!automodDB.useing.useCurseType) return
  if(automodDB.useing.useCurseIgnoreChannel?.includes(message.channel.id)) return
  let regex = false
  if(/(쌍)(년|놈)/.test(message.content)) regex = true
  if(!regex && /((씨|쓰|ㅅ|ㅆ|si)([0-9]+|\W+)(블|벌|발|빨|뻘|ㅂ|ㅃ|bal))/.test(message.content)) regex = true
  if(!regex && /((시발)(?!역)|((시|씨|쓰|ㅅ|ㅆ)([0-9]+|\W+|)(블|벌|발|빨|뻘|ㅂ|ㅃ))(!시발))/.test(message.content)) regex = true
  if(!regex && /((병|빙|븅|등|ㅂ)([0-9]+|\W+|)(신|싄|ㅅ)|ㅄ)/.test(message.content)) regex = true
  if(!regex && /((너|느(그|)|니)([0-9]+|\W+|)(금|애미|엄마|금마|검마))/.test(message.content)) regex = true
  if(!regex && /(개|게)(같|갓|새|세|쉐)/.test(message.content)) regex = true
  if(!regex && /(꼬|꽂|고)(추|츄)/.test(message.content)) regex = true
  if(!regex && /(니|너)(어|엄|엠|애|m|M)/.test(message.content)) regex = true
  if(!regex && /(노)(애|앰)/.test(message.content)) regex = true
  if(!regex && /((뭔|)개(소리|솔))/.test(message.content)) regex = true
  if(!regex && /(ㅅㅂ|ㅄ|ㄷㅊ)/.test(message.content)) regex = true
  if(!regex && /(놈|년|새끼)/.test(message.content)) regex = true
  if(regex) {
    findCurse(automodDB, message)
  } else {
    return
  }
}


const findCurse = async(automodDB: any, message: Message) => {
  if(automodDB.useing.useCurseType === "delete") {
    await message.reply('욕설 사용으로 자동 삭제됩니다')
      .then((m) => {
        setTimeout(()=> {
          m.delete()
        }, 5000)
      })
    return await message.delete()
  } else if (automodDB.useing.useCurseType === "delete_kick") {
    await message.reply('욕설 사용으로 자동 삭제 후 추방됩니다')
      .then((m) => {
        setTimeout(()=> {
          m.delete()
        }, 5000)
      })
    await message.delete()
    try {
      return message.member?.kick()
    } catch(e) {
      return 
    }
  } else if (automodDB.useing.useCurseType === "delete_ban") {
    await message.reply('욕설 사용으로 자동 삭제 후 차단됩니다')
    .then((m) => {
      setTimeout(()=> {
        m.delete()
      }, 5000)
    })
    await message.delete()
    try {
      return message.member?.ban({reason: '[배틀이] 욕설 사용 자동차단'})
    } catch(e) {
      return 
    }
  } else {
    return
  }
}