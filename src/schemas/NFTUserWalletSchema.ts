import { Schema, model, Model } from 'mongoose'

export interface nftWalletUserDB {
  user_id: string
  wallet_address: string
  published_date: Date
}

const nftUserWalletSchema: Schema<nftWalletUserDB> = new Schema(
  {
    user_id: String,
    wallet_address: String,
    published_date: { type: Date, default: Date.now }
  },
  {
    collection: 'nftUserWallet'
  }
)

const NFTUserWallet: Model<nftWalletUserDB> = model(
  'nftUserWallet',
  nftUserWalletSchema,
  'nftUserWallet'
)

export default NFTUserWallet
