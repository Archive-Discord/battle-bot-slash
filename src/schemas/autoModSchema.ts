import { Schema, model, Model } from 'mongoose'
import { AutoModDB } from '../../typings'

const automodSchema: Schema<AutoModDB> = new Schema(
  {
    guild_id: String,
    useing: {
      useUrl: { type: Boolean, default: false },
      useCurse: { type: Boolean, default: false },
      useBlackList: { type: Boolean, default: false },
      useCreateAt: { type: Number, default: 0 },
      useAutoRole: { type: Boolean, default: false },
      autoRoleId: { type: String, default: '' },
      useCurseType: String,
      useCurseIgnoreChannel: { type: Array, default: [] },
      useResetChannel: { type: Boolean, default: false },
      useResetChannels: { type: Array, default: [] }
    },
    published_date: { type: Date, default: Date.now }
  },
  { collection: 'automod' }
)

const Automod: Model<AutoModDB> = model('automod', automodSchema, 'automod')

export default Automod
