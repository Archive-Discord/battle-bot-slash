import { Schema, model } from 'mongoose'

const StatusSchema = new Schema({
  build_number: String,
  commands: String,
  totalShard: String,
  shard: [
    {
      shardNumber: Number,
      shardWsPing: String,
      shardPing: String,
      shardGuild: String,
      shardMember: String,
      shardChannels: String,
      shardUptime: String
    }
  ],
  published_date: { type: Date, default: Date.now, expires: 3600 }
})

const Status = model('status', StatusSchema, 'status')
// @ts-ignore
Status.schema.index({ published_date: 1 }, { expireAfterSeconds: 3600 })

export default Status
