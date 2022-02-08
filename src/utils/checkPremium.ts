import { Guild } from "discord.js";
import Premium from "../schemas/premiumSchemas";
import BotClient from "../structures/BotClient";

const checkPremium = async(client: BotClient, guild: Guild) => {
  let premium = await Premium.findOne({guild_id: guild.id})
  if(!premium){
    return false;
  } else {
    let now = new Date()
    let premiumDate = new Date(premium.nextpay_date)
    if(now < premiumDate) {
      return true
    } else {
      return false
    }
  }
}

export default checkPremium;