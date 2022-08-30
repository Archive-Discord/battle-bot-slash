import { Schema, model } from 'mongoose';
interface StockSchema {
  userid: string;
  stocks: Stock[];
}

export interface Stock {
  code: string;
  name: string;
  price: number;
  quantity: number;
}
const schema = new Schema<StockSchema>({
  userid: { type: String },
  stocks: { type: [] },
});

const StockSchema = model<StockSchema>('stock', schema, 'stock');

export default StockSchema;
