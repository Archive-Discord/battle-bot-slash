import { Schema, model } from 'mongoose'

const AlertSchema = new Schema({
  user_id: String,
  message: [
    {
      published_date: { type: Date, default: Date.now },
      read: Boolean,
      title: String,
      message: String,
      button: {
        required: false,

        url: String,
        value: String
      }
    }
  ],
  published_date: { type: Date, default: Date.now }
})

const Alert = model('alerts', AlertSchema, 'alerts')

export default Alert
