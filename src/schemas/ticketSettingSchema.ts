import { Schema, model } from 'mongoose'

const ticketSettingSchema = new Schema({
  guildId: String,
  categories: String,
  published_date: { type: Date, default: Date.now }
}, {collection: 'ticketSetting'})

const TicketSetting = model('ticketSetting', ticketSettingSchema, 'ticketSetting')
export default TicketSetting