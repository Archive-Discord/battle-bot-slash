import { Schema, model } from 'mongoose';
import { Custombot } from '../../typings/socket';

const custombotSchema: Schema<Custombot> = new Schema({
  guildId: {
    type: String,
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
  prefix: {
    type: String,
    required: false,
  },
  containerId: {
    type: String,
    required: true,
  },
  clusterId: {
    type: String,
    required: true
  },
  useage: {
    type: Boolean,
    required: true,
  },
  published_date: { type: Date, default: Date.now },
});

const Custombot = model('CustomBot', custombotSchema, 'CustomBot');

export default Custombot;
