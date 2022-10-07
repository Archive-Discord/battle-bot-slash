import nodeCache from 'node-cache';
export const searchStockCache = new nodeCache({ stdTTL: 60 * 70 });
export const stockCache = new nodeCache({ stdTTL: 60 * 40 });

export const searchStocksCache = new nodeCache({ stdTTL: 60 * 70 });
