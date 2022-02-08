import { Event } from '../structures/Event'
import CommandManager from '../managers/CommandManager'
import ErrorManager from '../managers/ErrorManager'
import { MessageCommand } from '../structures/Command'
import BotClient from '../structures/BotClient'
import { Message } from 'discord.js'
import Automod from '../schemas/autoModSchema'
import profanitys from '../contents/profanitys'

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
  const isCurse = () => {
    const regex = new RegExp(`\\b${profanitys.join("|")}\\b`, 'ig')
    return regex.test(message.content)
  }

  if (isCurse()) {
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
      return message.member?.kick()
    } else if (automodDB.useing.useCurseType === "delete_ban") {
      await message.reply('욕설 사용으로 자동 삭제 후 차단됩니다')
      .then((m) => {
        setTimeout(()=> {
          m.delete()
        }, 5000)
      })
      await message.delete()
      return message.member?.ban({reason: '[배틀이] 욕설 사용으로 인한 자동차단'})
    } else {
      return
    }
  }
}
