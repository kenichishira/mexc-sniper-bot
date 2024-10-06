const dotenv = require('dotenv');
const path = require('path');
const { ENV_MODE } = require('../config/index.js');
const envPath = path.join(__dirname, `${ENV_MODE === 'prod' ? '../.env.prod' : '../.env.dev'}`);

dotenv.config({ path: envPath });

const tg = require('./bot.js');
const connectDb = require('../db/connectDb.js');

let bot;

function main(error = false) {
	if (error) bot = tg();
	process.once('SIGINT', () => bot.stop('SIGINT'));
	process.once('SIGTERM', () => bot.stop('SIGTERM'));
}

process.on('exit', (message) => {
	console.log(`=> Exit, status code: ${message}`);
});

process.on('uncaughtException', function (error) {
	console.log(error.stack);
	bot.stop();
	main(true);
});

main();
connectDb().then(() => bot = tg());