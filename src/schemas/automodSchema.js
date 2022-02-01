const { Schema, model } = require('mongoose')

const automodSchema = Schema({
  guild_id: String,
  useing: {
    useUrl: {type: Boolean, default: false},
    useCurse: {type: Boolean, default: false},
    useBlackList: {type: Boolean, default: false},
    useCreateAt: {type: Number, default: 0}
  },
  published_date: { type: Date, default: Date.now },
}, {collection: 'automod'})

const Automod= model('automod', automodSchema, 'automod')

module.exports = { Automod }
