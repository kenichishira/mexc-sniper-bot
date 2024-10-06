const { createTrade } = require('../db/trade/trade.entity.js');
const { scrapeNewestTokens } = require('./scrape.js');

async function main() {
  // screape new token from website
  // // const tokens = await scrapeNewestTokens();
  // // console.log("tokens", tokens);

  // // if (!tokens) return;

  // // insert new token into database if found
  // const trade = await createTrade(tokens);

  // console.log("trade", trade);
  console.log('fhelow');

}

main();