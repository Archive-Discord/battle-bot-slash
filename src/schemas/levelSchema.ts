import { Schema, model, Model } from 'mongoose'
import { LevelDB } from '../../typings'

const LevelSchema: Schema<LevelDB> = new Schema(
  {
    user_id: String,
    guild_id: String,
    level: Number,
    currentXP: Number,
    published_date: { type: Date, default: Date.now }
  },
  { collection: 'userlevel' }
)

const Level: Model<LevelDB> = model('userlevel', LevelSchema, 'userlevel')

export default Level;
