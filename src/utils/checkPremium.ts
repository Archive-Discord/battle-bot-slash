import { Guild, User } from 'discord.js'
import Premium from '../schemas/premiumSchemas'
import PremiumUser from '../schemas/premiumUserSchemas'
import BotClient from '../structures/BotClient'

const checkGuildPremium = async (client: BotClient, guild: Guild) => {
  const premium = await Premium.findOne({ guild_id: guild.id })
  if (!premium) {
    return false
  } else {
    const now = new Date()
    const premiumDate = new Date(premium.nextpay_date)
    if (now < premiumDate) {
      return true
    } else {
      return false
    }
  }
}

const checkUserPremium = async (client: BotClient, user: User) => {
  const premium = await PremiumUser.findOne({ user_id: user.id })
  if (!premium) {
    return false
  } else {
    const now = new Date()
    const premiumDate = new Date(premium.nextpay_date)
    if (now < premiumDate) {
      return true
    } else {
      return false
    }
  }
}

export default checkGuildPremium
export { checkUserPremium, checkGuildPremium }
