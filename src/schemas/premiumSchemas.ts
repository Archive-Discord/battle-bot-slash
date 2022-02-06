import { Schema, model } from 'mongoose'

const premiumSchema = new Schema({
  guild_id: String,
  nextpay_date: { type: Date, default: Date.now },
  published_date: { type: Date, default: Date.now },
}, { collection: 'premiumGuild' })

const Premium = model('premiumGuild', premiumSchema, 'premiumGuild')

export default Premium