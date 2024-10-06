const { Scenes } = require('telegraf');
const store = require('../store');

const pendingJobWizard = new Scenes.WizardScene(
	'pendingJobWizard',
	async (ctx) => {
		ctx.reply('step one');
		ctx.wizard.next();
	},
	async (ctx) => {
		ctx.reply('step two');
		ctx.scene.leave();
	},
);

module.exports = pendingJobWizard;
