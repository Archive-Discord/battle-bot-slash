import { Schema, model } from 'mongoose'

const blacklistSchema = new Schema({
  user_id: String,
  report_user_id: String,
  reason: String,
  status: String,
  message: String,
  published_date: { type: Date, default: Date.now },
}, { collection: 'blacklist' })

const Blacklist = model('blacklist', blacklistSchema, 'blacklist')

export default Blacklist