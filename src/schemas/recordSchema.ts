import { Schema, model } from 'mongoose';
export interface RecordSchema {
  _id: string;
  guildId: string;
  channelId: string;
  published_date: Date;
  duration: number;
  status: 'recording' | 'end';
  file: string;
}

const schema = new Schema<RecordSchema>({
  guildId: { type: String },
  channelId: { type: String },
  duration: { type: Number, default: 0 },
  file: { type: String },
  status: { type: String, default: 'recording' },
  published_date: { type: Date, default: Date.now },
});

const RecordSchema = model<RecordSchema>('record', schema, 'record');

export default RecordSchema;
