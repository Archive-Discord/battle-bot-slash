import { Schema, model } from "mongoose"

const warningSchema = new Schema({
  userId: { type: String, default: '' },
  guildId: { type: String, default: '' },
  reason: { type: String, default: '' },
  managerId: { type: String, default: '' },
  published_date: { type: Date, default: Date.now }
}, {collection: 'warning'})

const Warning = model('warning', warningSchema, 'warning')

export default Warning
