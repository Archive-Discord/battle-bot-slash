const { Schema, model } = require('mongoose')

const blacklistSchema = Schema({
    user_id: String,
    report_user_id: String,
    reason: String,
    status: String,
    message: String,
    published_date: { type: Date, default: Date.now },
}, {collection: 'blacklist'})

const Blacklist = model('blacklist', blacklistSchema, 'blacklist')

module.exports = { Blacklist }
