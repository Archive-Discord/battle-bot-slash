import { Schema, model, Model } from 'mongoose'
import { HcsDB } from '../../typings'

const hcsSchema: Schema<HcsDB> = new Schema(
  {
    user_id: String,
    school: String,
    birthday: String,
    password: String,
    name: String,
    published_date: { type: Date, default: Date.now }
  },
  { collection: 'hcs' }
)

const hcs: Model<HcsDB> = model('hcs', hcsSchema, 'hcs')

export default hcs
