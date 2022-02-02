
const { Schema, model } = require('mongoose')
const premiumSchema = Schema({
    guild_id: String,
    nextpay_date: { type: Date, default: Date.now },
    published_date: { type: Date, default: Date.now },
}, {collection: 'premiumGuild'})

const Premium = model('premiumGuild', premiumSchema, 'premiumGuild')

module.exports = { Premium }
  