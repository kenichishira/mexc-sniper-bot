const mongoose = require('mongoose');

const tradeSchema = new mongoose.Schema({
  symbol: { type: String, required: true },
  introduction: { type: String },  // Brief description of the token
  launchTime: { type: Date, required: true },  // Date when the token is launched
  supply: {
    totalSupply: { type: Number },  // Total supply of the token
    circulatingSupply: { type: Number }  // Circulating supply of the token
  },
  marketData: {
    initialPrice: { type: Number },  // Initial listing price in USDT
    currentPrice: { type: Number },  // Current market price
    marketCap: { type: Number },  // Market capitalization in USDT
    volume24h: { type: Number }  // 24-hour trading volume in USDT
  },
  pid: { type: Number }, // process id
  // status: { type: String, enum: ['active', 'upcoming', 'delisted'], default: 'upcoming' },  // Status of the token
}, { versionKey: false, timestamps: true });

const Trade = mongoose.model('Trade', tradeSchema);
module.exports = Trade;
