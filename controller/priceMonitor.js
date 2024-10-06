


// Function to create a WebSocket connection and subscribe to price updates
function createWebSocket() {
  const ws = new WebSocket('wss://wbs.mexc.com/ws');

  ws.on('open', () => {
    console.log(`Connected to MEXC WebSocket for ${symbol}`);
    subscribeToPrice(ws);
  });

  ws.on('message', handleMessage);
  ws.on('close', handleClose);
  ws.on('error', handleError);
}

// Function to subscribe to price updates
function subscribeToPrice(ws) {
  const subscribeMessage = JSON.stringify({
    method: "SUBSCRIPTION",
    params: [`spot@public.deals.v3.api@${symbol}`],
    id: 1
  });
  ws.send(subscribeMessage);
  console.log(`Sent subscription message: ${subscribeMessage}`);
}

// Function to handle incoming messages
function handleMessage(data) {
  try {
    const parsedData = JSON.parse(data);
    console.log('Received message:', parsedData);
    if (parsedData.code == 0) return;

    const deals = parsedData.d.deals;

    if (deals && deals.length > 0) {
      const latestDeal = deals[deals.length - 1];
      const latestPrice = latestDeal.p;

      console.log(`Current price of ${parsedData.s}: ${latestPrice}`);
      process.stdout.write(`${parsedData.s} price: ${latestPrice}\n`);
    }
  } catch (error) {
    console.error('Error parsing message:', error);
  }
}

// Function to handle WebSocket closure
function handleClose(code, reason) {
  console.log(`WebSocket connection closed. Code: ${code}, Reason: ${reason || 'No reason provided'}`);
  if (code !== 1000) {
    console.log('Attempting to reconnect...');
    setTimeout(createWebSocket, 5000);
  }
}

// Function to handle WebSocket errors
function handleError(error) {
  console.error(`WebSocket error: ${error.message}`);
}

// Start tracking the price
createWebSocket();
