const { Schema, model } = require("mongoose");

let schema = Schema({
  user: {
    id: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
  }
})

export default model('user', schema)
