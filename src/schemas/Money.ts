import { Schema, model } from 'mongoose';
interface MoneySchema {
  money: number;
  userid: string;
  date: string;
  lastGuild: string;
}
const schema = new Schema<MoneySchema>({
  money: { type: Number },
  userid: { type: String },
  date: { type: String },
  lastGuild: { type: String },
});

const MoneySchema = model<MoneySchema>('money', schema, 'money');

export default MoneySchema;
