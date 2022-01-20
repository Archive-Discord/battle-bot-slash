const { Schema, model } = require('mongoose')

const ticketSchema = Schema({
  status: String,
  guildId: String,
  userId: String,
  ticketId: String,
  published_date: { type: Date, default: Date.now }
}, {collection: 'warning'})

const Ticket = model('ticket', ticketSchema, 'ticket')

module.exports = { Ticket }
