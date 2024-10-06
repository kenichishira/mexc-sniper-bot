const pendingJobWizard = require('./wizards/pendingJobWizard.js');
const openSniper = require('./wizards/openSniper.js');
// const runningJobWizard = require('./wizards/runningJobWizard.js');
// const sandBoxWizard = require('./wizards/sandBoxWizard.js');
// const stopLossWizard = require('./wizards/stopLossWizard.js');
// const successfulJobWizard = require('./wizards/successfulJobWizard.js');
// const takeProfitWizard = require('./wizards/takeProfitWizard.js');
// const updateAmountWizard = require('./wizards/updateAmountWizard.js');
// const updatePrivateKeyWizard = require('./wizards/updatePrivateKeyWizard.js');

module.exports = [
	openSniper,
	pendingJobWizard,
	// updatePrivateKeyWizard,
	// updateAmountWizard,
	// stopLossWizard,
	// takeProfitWizard,
	// runningJobWizard,
	// successfulJobWizard,
	// sandBoxWizard,
];
