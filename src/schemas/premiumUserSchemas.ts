import { Schema, model, Model } from 'mongoose'
import { PremiumUserDB } from '../../typings'

const premiumUserSchema = new Schema(
  {
    user_id: String,
    nextpay_date: { type: Date, default: Date.now },
    published_date: { type: Date, default: Date.now }
  },
  { collection: 'premiumUser' }
)

const PremiumUser: Model<PremiumUserDB> = model(
  'premiumUser',
  premiumUserSchema,
  'premiumUser'
)

export default PremiumUser
