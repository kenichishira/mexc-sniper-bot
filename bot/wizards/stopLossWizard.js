const { Scenes } = require('telegraf');
const store = require('../store');
const { backToMenu, goButton } = require('../utils/backToMenu');
const { updateUserData } = require('../../../service_dbOperations');


const stopLossWizard = new Scenes.WizardScene(
    'stopLossWizard',
    async (ctx) => {
        //step 0
        ctx.wizard.state.user = store.get(ctx.from.id);
        if (!ctx.wizard.state.user) return backToMenu(ctx, 'settings', 'Something went wrong. Please try again later');
        else {
            let msg = `<b>Stop Loss</b>\n\nStatus: ${ctx.wizard.state.user.stopLoss ? 'Enabled' : 'Disabled'}\n`;
            if (!ctx.wizard.state.user.low) msg += 'Percentage: Has not been set yet';
            else msg += `Percentage: ${ctx.wizard.state.user.low}`;
            ctx.wizard.state.msg = msg;
            await ctx.replyWithHTML(ctx.wizard.state.msg, {
                reply_markup: {
                    inline_keyboard: [
                        [
                            { text: ctx.wizard.state.user.stopLoss ? 'Disable' : 'Enable', callback_data: ctx.wizard.state.user.stopLoss ? 'disable' : 'enable' },
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
                        { text: ctx.wizard.state.user.stopLoss ? 'Disable' : 'Enable', callback_data: ctx.wizard.state.user.stopLoss ? 'disable' : 'enable' },
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
            const res = await updateUserData(ctx.from.id, { stopLoss: action==='enable'?true: false });
            if (!res.success){
                await ctx.reply('Something went wrong. Please try again later');
                return ctx.scene.reenter('stopLossWizard');
            }
            else {
                await ctx.reply(`Stop Loss successfully ${action==='enable'?'Enabled':'Disabled'} `);
                store.update(ctx.from.id, res.data);
                return ctx.scene.reenter('stopLossWizard');
            }

        }
        else if(action==='percentage') {
            await ctx.reply('Please enter Stop Loss Percentage. Value must be a negative percentage. For Example: -2%', goButton());
            return ctx.wizard.next();

        }
        else return backToMenu(ctx, 'main');
        
        },

        async(ctx)=>{
            //step 2
            const action= ctx?.update?.callback_query?.data;
            if(action === 'cancel') return backToMenu(ctx, 'settings');

            const message = ctx?.message?.text;
            if(!message) await ctx.reply('Please enter Stop Loss Percentage.', goButton());
            else if(message==='/start') return backToMenu(ctx, 'main');
            else if(!message.startsWith('-') || !message.endsWith('%') || isNaN(message.slice(0,-1))) await ctx.reply('Please enter a valid negative percentage value', goButton());
            else {
                const res = await updateUserData(ctx.from.id, { low: message });
                if (!res.success){
                    await ctx.reply('Something went wrong. Please try again later');
                    return ctx.scene.reenter('stopLossWizard');
                }
                else {
                    await ctx.reply('Stop Loss Percentage successfully updated');
                    store.update(ctx.from.id, res.data);
                    return ctx.scene.reenter('stopLossWizard');
                }

            }
        }

);



module.exports = stopLossWizard;
