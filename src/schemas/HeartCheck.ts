import { Schema, model } from 'mongoose'
interface HeartSchema {
  platform: string
  userid: string
  published_date: Date
}
const schema = new Schema<HeartSchema>({
  platform: String,
  userid: String,
  published_date: { type: Date, default: Date.now, expires: 43200 }
})

const HeartSchema = model<HeartSchema>('heartCheck', schema, 'heartCheck')
HeartSchema.schema.index({ published_date: 1 }, { expireAfterSeconds: 43200 })
export default HeartSchema
