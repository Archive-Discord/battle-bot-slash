import { Model, model, Schema } from 'mongoose';
import { DataBaseUser } from '../../typings';

const UserSchema: Schema<DataBaseUser> = new Schema(
  {
    _id: String,
    id: String,
    email: String,
    token: String,
    kakao_accessToken: String,
    kakao_refreshToken: String,
    kakao_email: String,
    kakao_name: String,
    tokenExp: Number,
    accessToken: String,
    refreshToken: String,
    expires_in: Number,
    google_accessToken: String,
    google_refreshToken: String,
    published_date: { type: Date, default: Date.now },
  },
  { collection: 'userData' },
);

const User: Model<DataBaseUser> = model('userData', UserSchema, 'userData');
export default User;
