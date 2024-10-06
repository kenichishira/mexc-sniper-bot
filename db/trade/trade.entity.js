const Trade = require('./trade.schema.js');


/**
 * Create a new Trade entry
 * @param {Object} tradeData - The data for the new trade
 */
async function createTrade(data) {
  try {
    const trade = new Trade(data);
    return await trade.save();
  } catch (error) {
    console.error('Error inserting tokens:', error);
    return null;
  }
}

/**
 * Create a new Trade entry
 * @param {Object} tradeData - The data for the new trade
 */
async function checkAndCreateTrade(tokenArray) {
  try {
    const existingTokens = await Trade.find({ symbol: { $in: tokenArray.map(token => token.symbol) } }).select('symbol');
    const existingTokenValues = existingTokens.map(doc => doc.symbol);
    const newTokens = tokenArray.filter(token => !existingTokenValues.includes(token.symbol));

    // insert only new tokens
    if (newTokens.length > 0) {
      console.log('Inserted new tokens:', newTokens);
      return await Token.insertMany(newTokens);
    } else {
      return console.log('No new tokens found.');
    }
  } catch (error) {
    console.error('Error inserting tokens:', error);
    return null;
  }
}

/**
 * Retrieve a trade by its symbol
 * @param {String} symbol - The symbol of the token
 */
async function getTradeBySymbol(symbol) {
  try {
    const trade = await Trade.findOne({ symbol: symbol.toUpperCase() });
    if (!trade) {
      throw new Error(`Trade with symbol ${symbol} not found`);
    }
    return trade;
  } catch (error) {
    console.error('Error retrieving trade:', error.message);
    return null;
  }
}

/**
 * Update a trade's market data
 * @param {String} symbol - The symbol of the token
 * @param {Object} marketData - The market data to update (e.g., currentPrice, marketCap)
 */
async function updateTradeMarketData(symbol, marketData) {
  try {
    const trade = await Trade.findOneAndUpdate(
      { symbol: symbol.toUpperCase() },
      { $set: { marketData } },
      { new: true }  // Returns the updated document
    );
    if (!trade) {
      throw new Error(`Trade with symbol ${symbol} not found`);
    }
    return trade;
  } catch (error) {
    console.error('Error updating trade market data:', error.message);
    return null;
  }
}

/**
 * Delete a trade by its symbol
 * @param {String} symbol - The symbol of the token
 */
async function deleteTrade(symbol) {
  try {
    const result = await Trade.findOneAndDelete({ symbol: symbol.toUpperCase() });
    if (!result) {
      throw new Error(`Trade with symbol ${symbol} not found`);
    }
    return result;
  } catch (error) {
    console.error('Error deleting trade:', error.message);
    return null;
  }
}

module.exports = {
  createTrade,
  checkAndCreateTrade,
  getTradeBySymbol,
  updateTradeMarketData,
  deleteTrade
};
