const { spawn } = require('child_process');
const { createTrade } = require('../db/trade/trade.entity');

async function openTradeChildProcess(tradeData) {
  const script = './controller/handleTrade.js';

  const data = await createTrade(tradeData);
  if (!data) return null;

  const childProcess = spawn('node', [script, JSON.stringify({ ...tradeData, tradeId: data.id })]);
  data.pid = childProcess.pid;
  await data.save();

  childProcess.stdout.on('data', (data) => {
    console.log(`Price Monitor Output: ${data}`);
  });

  childProcess.stderr.on('data', (data) => {
    console.error(`Price Monitor Error: ${data}`);
  });

  childProcess.on('close', (code) => {
    console.log(`Price Monitor process exited with code ${code}`);
  });

  return true;
}

module.exports = openTradeChildProcess;
