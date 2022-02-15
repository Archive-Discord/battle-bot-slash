import { Schema, model, Model } from 'mongoose'
import { PremiumDB } from '../../typings'

const premiumSchema = new Schema(
  {
    guild_id: String,
    nextpay_date: { type: Date, default: Date.now },
    published_date: { type: Date, default: Date.now }
  },
  { collection: 'premiumGuild' }
)

const Premium: Model<PremiumDB> = model('premiumGuild', premiumSchema, 'premiumGuild')

export default Premium
