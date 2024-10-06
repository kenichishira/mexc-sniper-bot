const menu = require('../menu/menu');

const backToMenu = async (ctx, type, message) => {
	if (message) await ctx.reply(message);
	await ctx.replyWithHTML(`<b>${type === 'settings' ? 'Settings' : 'Main'} Menu</b>`, {
		reply_markup: menu(type === 'settings' ? 'settings' : 'main'),
	});
	return ctx.scene.leave();
};

const goBack = async (ctx, type, message = '') => {
	if (message) await ctx.reply(message);
	await ctx.replyWithHTML(`<b>${type === 'liquidity' ? 'Liquidity Snipe Option' : 'Performance Trade Option'}</b>`, {
		reply_markup: menu(type === 'liquidity' ? 'liquiditySnipe' : 'performanceTrade'),
	});
	return ctx.scene.leave();
};

const cancelButton = (name = 'Cancel', data = 'cancel') => {
	return {
		reply_markup: {
			inline_keyboard: [[{ text: name, callback_data: data }]],
		},
	};
};

module.exports = {
	backToMenu,
	goBack,
	cancelButton,
};
