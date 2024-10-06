
// Get token from the command-line arguments
let { symbol, launchTime } = JSON.parse(process.argv[2]);

if (!symbol || !launchTime) {
  console.error('Token symbol is required!');
  process.exit(1);
}

symbol = symbol.toUpperCase() + 'USDT';
console.log(`Tracking price for ${symbol} via WebSocket...`);
