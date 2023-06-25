import { Schema, model, Model } from 'mongoose';

export interface nftVerifyDB {
  guild_id: string;
  wallet: string;
  role_id: string;
  published_date: Date;
}

const nftVerifySchema: Schema<nftVerifyDB> = new Schema(
  {
    guild_id: String,
    role_id: String,
    wallet: String,
    published_date: { type: Date, default: Date.now },
  },
  {
    collection: 'nftGuildVerify',
  },
);

const NFTGuildVerify: Model<nftVerifyDB> = model(
  'nftGuildVerify',
  nftVerifySchema,
  'nftGuildVerify',
);

export default NFTGuildVerify;
