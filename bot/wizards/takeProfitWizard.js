const { Scenes } = require('telegraf');
const store = require('../store');
const { backToMenu, goButton } = require('../utils/backToMenu');
const { updateUserData } = require('../../../service_dbOperations');


const takeProfitWizard = new Scenes.WizardScene(
    'takeProfitWizard',
    async (ctx) => {
        //step 0
        ctx.wizard.state.user = store.get(ctx.from.id);
        if (!ctx.wizard.state.user) return backToMenu(ctx, 'settings', 'Something went wrong. Please try again later');
        else {
            let msg = `<b>Take Profit</b>\n\nStatus: ${ctx.wizard.state.user.takeProfit ? 'Enabled' : 'Disabled'}\n`;
            if (!ctx.wizard.state.user.peak) msg += 'Percentage: Has not been set yet';
            else msg += `Percentage: ${ctx.wizard.state.user.peak}`;
            ctx.wizard.state.msg = msg;
            await ctx.replyWithHTML(ctx.wizard.state.msg, {
                reply_markup: {
                    inline_keyboard: [
                        [
                            { text: ctx.wizard.state.user.takeProfit ? 'Disable' : 'Enable', callback_data: ctx.wizard.state.user.takeProfit ? 'disable' : 'enable' },
                            { text: 'Percentage', callback_data: 'percentage' }
                        ],
                        [
                            { text: 'Go Back', callback_data: 'goBack' },
                            { text: 'Main Menu', callback_data: 'mainMenu' }
                        ]

                    ]
                }
            });
            return ctx.wizard.next();
        }
    },

    async (ctx) => {
        //step 1
        const message= ctx?.message?.text;
        if(message==='/start') return backToMenu(ctx, 'main');

        const action = ctx?.update?.callback_query?.data;
        if (!action)  await ctx.replyWithHTML(ctx.wizard.state.msg, {
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: ctx.wizard.state.user.takeProfit ? 'Disable' : 'Enable', callback_data: ctx.wizard.state.user.takeProfit ? 'disable' : 'enable' },
                        { text: 'Percentage', callback_data: 'percentage' }
                    ],
                    [
                        { text: 'Go Back', callback_data: 'goBack' },
                        { text: 'Main Menu', callback_data: 'mainMenu' }
                    ]

                ]
            }
        });
        else if(action==='goBack') return backToMenu(ctx, 'settings');  
        else if(action==='enable' || action==='disable') {
            const res = await updateUserData(ctx.from.id, { takeProfit: action==='enable'?true: false });
            if (!res.success){
                await ctx.reply('Something went wrong. Please try again later');
                return ctx.scene.reenter('takeProfitWizard');
            }
            else {
                await ctx.reply(`Take Profit successfully ${action==='enable'?'Enabled':'Disabled'} `);
                store.update(ctx.from.id, res.data);
                return ctx.scene.reenter('takeProfitWizard');
            }

        }
        else if(action==='percentage') {
            await ctx.reply('Please enter Take Profit Percentage. Value must be a positive percentage. For Example: 5%', goButton());
            return ctx.wizard.next();

        }
        else return backToMenu(ctx, 'main');
        
        },

        async(ctx)=>{
            //step 2
            const action= ctx?.update?.callback_query?.data;
            if(action === 'cancel') return backToMenu(ctx, 'settings');

            const message = ctx?.message?.text;
            if(!message) await ctx.reply('Please enter Take Profit Percentage.', goButton());
            else if(message==='/start') return backToMenu(ctx, 'main');
            else if(message.startsWith('-') || !message.endsWith('%') || isNaN(message.slice(0,-1))) await ctx.reply('Please enter a valid positive percentage value', goButton());
            else {
                const res = await updateUserData(ctx.from.id, { peak: message });
                if (!res.success){
                    await ctx.reply('Something went wrong. Please try again later');
                    return ctx.scene.reenter('takeProfitWizard');
                }
                else {
                    await ctx.reply('Take Profit Percentage successfully updated');
                    store.update(ctx.from.id, res.data);
                    return ctx.scene.reenter('takeProfitWizard');
                }

            }
        }

);



module.exports = takeProfitWizard;
