import { Schema, model } from 'mongoose';

export interface Ticket {
  channelId: string;
  guildId: string;
  status: string;
  ticketId: string;
  userId: string;
  messages: string[];
  messagesHTML: string;
  published_date: Date;
}

const ticketSchema = new Schema<Ticket>(
  {
    status: String,
    guildId: String,
    channelId: String,
    userId: String,
    ticketId: String,
    messages: Array,
    messagesHTML: String,
    published_date: { type: Date, default: Date.now },
  },
  { collection: 'ticket' },
);

const Ticket = model('ticket', ticketSchema, 'ticket');

export default Ticket;
