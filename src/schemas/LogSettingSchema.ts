import { Schema, model, Model } from 'mongoose';
import { loggerDB } from '../../typings';

const LoggerSettingSchema = new Schema<loggerDB>(
  {
    guild_id: String,
    guild_channel_id: String,
    loggerFlags: Number,
    published_date: { type: Date, default: Date.now },
  },
  { collection: 'LogChannel' },
);

const LoggerSetting: Model<loggerDB> = model('LogChannel', LoggerSettingSchema, 'LogChannel');

export default LoggerSetting;
