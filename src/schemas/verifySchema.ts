import { Schema, model, Model } from 'mongoose';
import { VerifyDB } from '../../typings';

const VerifySchema: Schema<VerifyDB> = new Schema(
  {
    guild_id: String,
    user_id: String,
    token: String,
    status: String,
    role: String,
    deleteRole: String,
    type: String,
    expires_in: { type: Date },
    published_date: { type: Date, default: Date.now },
  },
  { collection: 'Verify' },
);

const Verify: Model<VerifyDB> = model('Verify', VerifySchema, 'Verify');

export default Verify;
