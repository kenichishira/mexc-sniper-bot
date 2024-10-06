const { Markup } = require('telegraf');
const sliceButton = require('./sliceButton.js');

module.exports = function (menu, size = 2) {
	const buttonList = sliceButton(menu, size);
	return { inline_keyboard: buttonList.map((row) => row.map((item) => Markup.button.callback(item.name, `demo_${item.id}_${item.name}`))) };
};
