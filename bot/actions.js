const menu = require('./menu/menu.js');

module.exports = async function (bot, store) {
	bot.action('main_menu', (ctx) => ctx.replyWithHTML('<b>Main Menu</b>', { reply_markup: menu('main') }));
	bot.action('open_sniper', (ctx) => ctx.scene.enter('openSniper'));
	bot.action('pending_job', (ctx) => ctx.scene.enter('pendingJobWizard'));
	bot.action('running_job', (ctx) => ctx.scene.enter('runningJobWizard'));
	bot.action('successfull_job', (ctx) => ctx.scene.enter('successfulJobWizard'));
	bot.action('settings', (ctx) => ctx.replyWithHTML('<b>Settings</b>', { reply_markup: menu('settings') }));
	bot.action('update_key', (ctx) => ctx.scene.enter('updatePrivateKeyWizard'));
	bot.action('amount_eth', (ctx) => ctx.scene.enter('updateAmountWizard'));
	bot.action('stop_loss', (ctx) => ctx.scene.enter('stopLossWizard'));
	bot.action('take_profit', (ctx) => ctx.scene.enter('takeProfitWizard'));
	bot.action('sand_box', (ctx) => ctx.scene.enter('sandBoxWizard'));
};
