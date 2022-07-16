import { model, Schema } from 'mongoose'

const localeSchema = new Schema({
  guildID: String,
  locale: {
    default: 'ko'
  }
})

export default model('locales', localeSchema, 'locales')
