import { Guild } from "discord.js";
import Premium from "../schemas/premiumSchemas";
import BotClient from "../structures/BotClient";

const checkPremium = async(client: BotClient, guild: Guild) => {
  const premium = await Premium.findOne({guild_id: guild.id})
  if(!premium){
    return false;
  } else {
    const now = new Date()
    const premiumDate = new Date(premium.nextpay_date)
    if(now < premiumDate) {
      return true
    } else {
      return false
    }
  }
}

export default checkPremium;