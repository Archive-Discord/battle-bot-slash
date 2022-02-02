const { Schema, model } = require('mongoose')

const VerifySettingSchema = new Schema({
  guild_id: String,
  role_id: String,
  type: String,
  published_date: { type: Date, default: Date.now },
}, {collection: 'VerifySetting'})

const VerifySetting = model('VerifySetting', VerifySettingSchema, 'VerifySetting')

module.exports = VerifySetting