const { ALLOWED_TELEGRAM_USER } = require('../../config');

module.exports = async function (ctx, next) {
	try {
		if (!ALLOWED_TELEGRAM_USER.includes(ctx.from.id)) {
			return ctx.reply(`Your have not authorized access to use this bot. Your telegram Id : ${ctx.from.id}. Please contact with admin.`);
		}

		ctx.triggerAt = new Date();
		next();
	} catch (error) {
		console.error(error);
		return ctx.reply('Something went wrong.');
	}
};
