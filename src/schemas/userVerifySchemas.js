const { Schema, model } = require('mongoose')

const VerifySchema = new Schema({
  guild_id: String,
  user_id: String,
  token: String,
  status: String,
  published_date: { type: Date, default: Date.now },
})

const Verify = model('Verify', VerifySchema, 'Verify')

module.exports = Verify