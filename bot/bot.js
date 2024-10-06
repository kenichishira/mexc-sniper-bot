const { Telegraf, Scenes, session } = require('telegraf');
const menu = require('./menu/menu.js');
const store = require('./store.js');
const actions = require('./actions.js');
const wizards = require('./wizard.js');
const validateUser = require('./middleware/validateUser.js');

module.exports = function tg() {
	// chekcing for bot token
	if (!process.env.BOT_TOKEN) throw new Error('"BOT_TOKEN" env var is missing!');

	// initialized the bot
	const bot = new Telegraf(process.env.BOT_TOKEN);

	// validate user
	bot.use(validateUser)

	// handling sessions
	bot.use(session());

	// include all the additional wizards here as needed
	const stage = new Scenes.Stage(wizards);
	bot.use(stage.middleware());

	// start the bot
	bot.start(async (ctx) => {

		ctx.replyWithHTML('<b>Available Menu</b>', {
			reply_markup: menu('main'),
		});
	});

	// help commands goes here
	bot.help((ctx) => {
		console.log(ctx);
		// handle help functionality here
	});

	// listen for specific message
	bot.hears(/.*/, (ctx) => {
		// console.log(ctx);
	});

	// handle error globally.
	bot.catch((err, ctx) => {
		console.error(`Error for ${ctx.updateType}`, err);
		ctx.reply('Something went wrong');
	});

	// load actions
	actions(bot, store);

	// lunch the bot
	bot.launch();

	// checking the bot is started or not
	console.log('=> Bot started...');

	return bot;
};

module.exports.store = store;
