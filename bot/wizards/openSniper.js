const { Scenes } = require('telegraf');
const store = require('../store');
const openTradeChildProcess = require('../../controller/tradeChildProcess.js');
const menu = require('../menu/menu');
const validateDateFormat = require('../utils/validateDate');
// const { backToMenu, goButton, goBack } = require('../utils/backToMenu');

const openSniper = new Scenes.WizardScene(
	'openSniper',
	async (ctx) => {
		//step 0
		await ctx.reply('Please enter a valid token symbol that you want to snipe?');
		return ctx.wizard.next();
	},
	async (ctx) => {
		//step 1
		const message = ctx?.message?.text;
		if (!message) await ctx.reply('Please enter a valid token symbol that you want to snipe', goButton());
		else if (message === '/start') return backToMenu(ctx, 'main');
		else {
			ctx.wizard.state.symbol = message.toUpperCase();
			await ctx.reply(`Please enter ${ctx.wizard.state.symbol} launchtime? ex: 2024-10-05 16:00:00`);
			return ctx.wizard.next();
		}
	},
	async (ctx) => {
		//step 2
		const message = ctx?.message?.text;
		if (!message) await ctx.reply(`Please enter ${ctx.wizard.state.symbol} launchtime? ex: 2024-10-05 16:00:00`);
		else if (message === '/start') return backToMenu(ctx, 'main');
		else {
			const launchTime = validateDateFormat(message);
			if (!launchTime) return ctx.reply('Invalid launch time received! Please enter a valid launch time. ex: 2024-10-05 16:00:00');

			// start token monitor from here.
			const order = await openTradeChildProcess({ ...ctx.wizard.state, launchTime });

			await ctx.reply(`${order === null ? 'Faile to open Trade. Try again later.' : 'Trade Place Successfully'}`, { reply_markup: menu('main') });
			return ctx.scene.leave();
		}
	}
);

module.exports = openSniper;
