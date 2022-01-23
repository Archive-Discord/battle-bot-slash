const { Schema, model } = require('mongoose')

const ticketSettingSchema = Schema({
  guildId: String,
  categories: String,
  published_date: { type: Date, default: Date.now }
}, {collection: 'ticketSetting'})

const TicketSetting = model('ticketSetting', ticketSettingSchema, 'ticketSetting')

module.exports = { TicketSetting }
