import { Schema, model } from 'mongoose'

const automodSchema = new Schema(
  {
    guild_id: String,
    useing: {
      useUrl: { type: Boolean, default: false },
      useCurse: { type: Boolean, default: false },
      useBlackList: { type: Boolean, default: false },
      useCreateAt: { type: Number, default: 0 },
      useAutoRole: { type: Boolean, default: false },
      autoRoleId: { type: String, default: '' }
    },
    published_date: { type: Date, default: Date.now }
  },
  { collection: 'automod' }
)

const Automod = model('automod', automodSchema, 'automod')

export default Automod
