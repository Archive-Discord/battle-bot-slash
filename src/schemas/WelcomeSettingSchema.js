const { Schema, model } = require('mongoose')

const WelcomeSettingSchema = new Schema({
  guild_id: String,
  welcome_message: { type: String, default: ''},
  outting_message: { type: String, default: ''},
  channel_id: String,
  published_date: { type: Date, default: Date.now },
}, {collection: 'greetingGuild'})

const WelcomeSetting = model('greetingGuild', WelcomeSettingSchema, 'greetingGuild')

module.exports = { WelcomeSetting }
