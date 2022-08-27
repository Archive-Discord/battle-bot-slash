import { Schema, model, Model } from 'mongoose';
import { LevelGuildDB } from '../../typings';

const LevelSettingSchema: Schema<LevelGuildDB> = new Schema(
  {
    guild_id: String,
    useage: Boolean,
    published_date: { type: Date, default: Date.now },
  },
  { collection: 'levelsetting' },
);

const Level: Model<LevelGuildDB> = model('levelsetting', LevelSettingSchema, 'levelsetting');

export default Level;
