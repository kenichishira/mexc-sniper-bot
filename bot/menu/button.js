// all the commands(buttons with call_back_query) that needs to handle will put here
const defaultMenu = [
	{
		main: [
			['Open Sniper', 'open_sniper'],
			// ['Pending Job', 'pending_job'],
			// ['Running Job', 'running_job'],
			// ['Successful Job', 'successfull_job'],
			['Settings', 'settings'],
		],
		row: 2,
	},
	{
		settings: [
			['Add/ Update Key', 'update_key'],
			['Amount (ETH)', 'amount_eth'],
			['Stop Loss', 'stop_loss'],
			['Take Profit', 'take_profit'],
			['Gass Tip', 'gas_tip'],
			['Slippage', 'slippage'],
			['Sand Box', 'sand_box'],
			['Main Menu', 'main_menu'],
		],
		row: 2,
	},
	{
		primary: [['Main Menu', 'main_menu'], ['Hello World', 'hello_world'], ['']],
	},
];

module.exports = { defaultMenu };
