import { Schema, model, Model } from 'mongoose';
import { PubgDB } from '../../typings';

const PubgStatsSchema: Schema<PubgDB> = new Schema(
  {
    user_id: String,
    nickname: String,
    platform: String,
    stats: {
      rankSoloTpp: Object,
      rankSoloFpp: Object,
      rankSquardTpp: Object,
      rankSquardFpp: Object,
      soloFpp: Object,
      soloTpp: Object,
      duoFpp: Object,
      duoTpp: Object,
      SquardFpp: Object,
      SquardTpp: Object,
    },
    last_update: { type: Date, default: Date.now },
    published_date: { type: Date, default: Date.now },
  },
  { collection: 'pubgstats' },
);

const PubgStats: Model<PubgDB> = model('pubgstats', PubgStatsSchema, 'pubgstats');

export default PubgStats;
