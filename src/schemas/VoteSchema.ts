import { Schema, model, Model } from 'mongoose'
import { VoteDB } from '../../typings';

const VoteSchema: Schema<VoteDB> = new Schema({
  guild_id: String,
  message_id: String,
  vote_items: [
    {
      item_id: String,
      item_name: String,
      vote: Number,
      voted: [String]
    }
  ],
  status: String,
  published_date: { type: Date, default: Date.now },
}, { collection: 'votes' })

const Votes: Model<VoteDB> = model("votes", VoteSchema, "votes");

export default Votes;
