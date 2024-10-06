const axios = require('axios');
const crypto = require('node:crypto');

const API_KEY = process.env.API_KEY;
const API_SECRET = process.env.API_SECRET;

class MEXCApi {
  constructor(apiKey, secretKey) {
    this.apiKey = apiKey;
    this.secretKey = secretKey;
    this.baseURL = 'https://api.mexc.com';
    this.axiosInstance = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json',
        'X-MEXC-APIKEY': this.apiKey,
      }
    });
  }

  /**
   * Create a query string for the request signature
   */
  createSignature(queryString) {
    return crypto.createHmac('sha256', this.secretKey)
      .update(queryString)
      .digest('hex');
  }

  /**
   * Public API (no authentication required)
   * Example: Get ticker price for a symbol
   */
  async getTickerPrice(symbol) {
    try {
      const response = await this.axiosInstance.get(`/api/v3/ticker/price`, {
        params: { symbol: symbol.toUpperCase() + 'USDT' }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching ticker price:', error);
      throw error;
    }
  }

  /**
   * Public API (no authentication required)
   * Get exchange information for a specific symbol
   */
  async getExchangeInfo(symbol) {
    try {
      const response = await this.axiosInstance.get(`/api/v3/exchangeInfo`);

      // Find the specific symbol's data from the response
      const symbolInfo = response.data?.symbols?.find(s => s.symbol === symbol.toUpperCase() + 'USDT');

      if (!symbolInfo) {
        throw new Error(`Symbol ${symbol} not found`);
      }

      return symbolInfo;
    } catch (error) {
      console.error('Error fetching exchange info:', error);
      return error?.response?.data || { msg: error?.message };
    }
  }


  /**
   * Private API (requires authentication)
   * Example: Get account information
   */
  async getAccountInfo() {
    try {
      const timestamp = Date.now();
      const query = `timestamp=${timestamp}`;
      const signature = this.createSignature(query);
      const response = await this.axiosInstance.get(`/api/v3/account`, {
        params: {
          timestamp,
          signature
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching account info:', error);
      return error?.response?.data || { msg: error?.message };
    }
  }

  /**
   * Place an order (Private Endpoint)
   * Automatically uses USDT as the quote currency
   * Can handle both market and limit orders
   * Uses quote quantity for market buy orders (quoteOrderQty)
   */
  async placeOrder({ token, side, type, quantity, quoteQuantity = null, price = null, timeInForce = 'GTC' }) {
    try {
      const symbol = token.toUpperCase() + 'USDT';
      console.log('symbol', symbol);
      const timestamp = Date.now();
      const params = {
        symbol,
        side,
        type,
        timestamp
      };

      // If it's a MARKET BUY order with quote quantity, use 'quoteOrderQty'
      if (type === 'MARKET' && side === 'BUY' && quoteQuantity) {
        params.quoteOrderQty = quoteQuantity;
      } else {
        params.quantity = quantity;
      }

      // If it's a LIMIT order, add price and timeInForce
      if (type === 'LIMIT') {
        if (!price) {
          throw new Error('Price is required for limit orders');
        }
        params.price = price;
        params.timeInForce = timeInForce;
      }

      const queryString = new URLSearchParams(params).toString();
      console.log('queryString', queryString);
      const signature = this.createSignature(queryString);

      const response = await this.axiosInstance.post(`/api/v3/order`, null, {
        params: {
          ...params,
          signature
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error placing order:');
      return error?.response?.data || { msg: error?.message };
    }
  }
}

module.exports = new MEXCApi(API_KEY, API_SECRET);

// (async () => {
//   const API_KEY = 'mx0vgly686GhCwxVTk'
//   const API_SECRET = '444d554f669143b082c7b7f050273736'
//   const symbol = 'POPCAT';

//   const mexc = new MEXCApi(API_KEY, API_SECRET);
// const tickerPrice = await mexc.getTickerPrice('dogs');
// console.log('tickerPrice', tickerPrice);

// const exchangeInfo = await mexc.getExchangeInfo(symbol);
// console.log('exchangeInfo', exchangeInfo);

// const accInfo = await mexc.getAccountInfo(symbol);
// console.log('accInfo', accInfo);

// const data = { token: symbol, side: 'BUY', type: 'MARKET', quoteQuantity: 2 }
// const order = await mexc.placeOrder(data);
// console.log('order ', order);
// })()
