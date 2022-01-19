const mongoose = require("mongoose");

const warningSchema = mongoose.Schema({
    userId: {
        type: String,
        default: ""
    },
    guildId: {
        type: String,
        default: ""
    },
    reason: {
        type: String,
        default: ""
    },
    managerId: {
        type: String,
        default: ""
    },
    published_date: { type: Date, default: Date.now }
}, {collection: 'warning'});

const Warning = mongoose.model('warning', warningSchema);

module.exports = { Warning }
