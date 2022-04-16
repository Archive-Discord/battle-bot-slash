import { Schema, model, Model } from 'mongoose'
import { AutoTaskRoleDB } from '../../typings'

const AutoRoleSchema: Schema<AutoTaskRoleDB> = new Schema(
  {
    guild_id: String,
    message_id: String,
    token: String,
    isKeep: Boolean,
    published_date: { type: Date, default: Date.now }
  },
  { collection: 'AutoTaskRole' }
)

const AutoTaskRole: Model<AutoTaskRoleDB> = model(
  'AutoTaskRole',
  AutoRoleSchema,
  'AutoTaskRole'
)

export default AutoTaskRole
