import { Schema, model } from 'mongoose';
import { DiceDB } from '../../typings';

const diceGameSchema = new Schema<DiceDB>(
  {
    userId: String,
    betted: Number,
    winType: String,
    published_date: { type: Date, default: Date.now },
  },
  { collection: 'dicegame' },
);

const Dicegame = model('dicegame', diceGameSchema, 'dicegame');

export default Dicegame;
