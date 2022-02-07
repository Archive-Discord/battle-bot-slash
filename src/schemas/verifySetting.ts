import { Model, model, Schema } from "mongoose"
import { VerifySettingDB } from "typings"

const VerifySettingSchema: Schema<VerifySettingDB> = new Schema({
  guild_id: String,
  role_id: String,
  type: String,
  published_date: { type: Date, default: Date.now },
}, {collection: 'VerifySetting'})

const VerifySetting: Model<VerifySettingDB> = model('VerifySetting', VerifySettingSchema, 'VerifySetting')

export default VerifySetting