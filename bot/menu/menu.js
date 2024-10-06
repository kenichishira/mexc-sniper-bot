const { Markup } = require('telegraf');
const { defaultMenu } = require('./button.js');
const sliceButton = require('./sliceButton.js');

module.exports = function (type) {
	const menu = [...defaultMenu];

	const fallBack = {
		inline_keyboard: [[Markup.button.callback('↰ Main Menu', 'clear')]],
	};

	if (!type) {
		const primary = menu.find((menuItem) => menuItem.primary);
		if (primary) {
			const commandToSend = sliceButton(primary.primary, primary.row);
			return { inline_keyboard: commandToSend.map((row) => row.map(([name, action]) => Markup.button.callback(name, action))) };
		}
	}

	const matched = menu.find((menuItem) => menuItem[type]);
	if (!matched) return fallBack;

	const commandToSend = sliceButton(matched[type], matched.row);
	return { inline_keyboard: commandToSend.map((row) => row.map(([name, action]) => Markup.button.callback(name, action))) };
};
