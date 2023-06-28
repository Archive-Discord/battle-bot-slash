import { Schema, model, Model } from 'mongoose';
import { AutoModDB } from '../../typings';

const automodSchema: Schema<AutoModDB> = new Schema(
  {
    /**
     * @deprecated use guildId
     */
    guild_id: String,
    /**
     * @deprecated use event
     */
    useing: {
      useUrl: { type: Boolean, default: false },
      useCurse: { type: Boolean, default: false },
      useBlackList: { type: Boolean, default: false },
      useCreateAt: { type: Number, default: 0 },
      useAutoRole: { type: Boolean, default: false },
      autoRoleId: { type: String, default: '' },
      useCurseType: String,
      useCurseIgnoreChannel: { type: Array, default: [] },
      useResetChannel: { type: Boolean, default: false },
      useResetChannels: { type: Array, default: [] },
    },
    guildId: String,
    event: String,
    start: String,
    published_date: { type: Date, default: Date.now },
  },
  { collection: 'automod' },
);

const Automod: Model<AutoModDB> = model('automod', automodSchema, 'automod');

export default Automod;
