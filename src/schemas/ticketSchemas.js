const { Schema, model } = require('mongoose')

const ticketSchema = Schema({
  status: String,
  guildId: String,
  channelId: String,
  userId: String,
  ticketId: String,
  messages: Array,
  published_date: { type: Date, default: Date.now }
}, {collection: 'ticket'})

const Ticket = model('ticket', ticketSchema, 'ticket')

module.exports = { Ticket }
