import { Schema, model, Model } from 'mongoose'
import { MusicDB } from '../../typings'

const MusicSettingSchema: Schema<MusicDB> = new Schema(
  {
    guild_id: String,
    channel_id: String,
    messageid_list: String,
    messageid_banner: String
  },
  { collection: 'Music' }
)

const MusicSetting: Model<MusicDB> = model('Music', MusicSettingSchema, 'Music')

export default MusicSetting
