import { Schema, model, Model } from 'mongoose';
import { LoginState } from '../../typings';

const loginStateSchema: Schema<LoginState> = new Schema(
  {
    state: String,
    redirect_uri: String,
    published_date: { type: Date, default: Date.now },
  },
  { collection: 'loginState' },
);

const LoginState: Model<LoginState> = model('loginState', loginStateSchema, 'loginState');
LoginState.schema.index({ published_date: 1 }, { expireAfterSeconds: 1800 }); // 30분

export default LoginState;
