import { Schema, model } from 'mongoose';

const WelcomeSettingSchema = new Schema(
  {
    guild_id: String,
    welcome_message: { type: String, default: '' },
    outting_message: { type: String, default: '' },
    message_type: { type: String },
    channel_id: String,
    published_date: { type: Date, default: Date.now },
  },
  { collection: 'greetingGuild' },
);

const WelcomeSetting = model('greetingGuild', WelcomeSettingSchema, 'greetingGuild');

export default WelcomeSetting;
