import { Schema, model } from "mongoose"

const LoggerSettingSchema = new Schema(
  {
    guild_id: String,
    guild_channel_id: String,
    useing: {
      memberJoin: { type: Boolean, default: false },
      memberLeft: { type: Boolean, default: false },
      memberKick: { type: Boolean, default: false },
      memberBan: { type: Boolean, default: false },
      deleteMessage: { type: Boolean, default: false },
      editMessage: { type: Boolean, default: false },
      reactMessage: { type: Boolean, default: false },
      createChannel: { type: Boolean, default: false },
      deleteChannel: { type: Boolean, default: false },
      editChannel: { type: Boolean, default: false },
      joinVoiceChannel: { type: Boolean, default: false },
      leaveVoiceChannel: { type: Boolean, default: false },
    },
    published_date: { type: Date, default: Date.now },
  },
  { collection: "LogChannel" }
)

const LoggerSetting = model("LogChannel", LoggerSettingSchema, "LogChannel")

export default LoggerSetting
