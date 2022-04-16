import { Schema, model, Model } from 'mongoose'
import { nftVerifyUserDB } from '../../typings'

const nftVerifyUserSchema: Schema<nftVerifyUserDB> = new Schema(
  {
    guild_id: String,
    user_id: String,
    token: String,
    process: String,
    published_date: { type: Date, default: Date.now }
  },
  {
    collection: 'nftUserVerify'
  }
)

const NFTUserVerify: Model<nftVerifyUserDB> = model(
  'nftUserVerify',
  nftVerifyUserSchema,
  'nftUserVerify'
)

export default NFTUserVerify
