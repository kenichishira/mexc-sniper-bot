const { Scenes } = require('telegraf');
const { backToMenu, goButton } = require('../utils/backToMenu');
const { encryptPrivateKey, updateUserData } = require('../../../service_dbOperations');
const store = require('../store');


const updatePrivateKeyWizard = new Scenes.WizardScene(
    'updatePrivateKeyWizard',
    async (ctx) => {
        //step 0
        await ctx.reply('Do you want update your wallet private key?', {
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: 'Yes', callback_data: 'yes' },
                        { text: 'No', callback_data: 'no' },
                    ],
                    [
                        { text: 'Main Menu', callback_data: 'mainMenu' },
                    ]
                ]
            }
        });
        return ctx.wizard.next();
    },


    async (ctx) => {
        //step 1
        const message= ctx?.message?.text;
        if(message==='/start') return backToMenu(ctx, 'main');

        const action = ctx?.update?.callback_query?.data;
        if (!action) await ctx.reply('Do you want update your wallet private key?', {
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: 'Yes', callback_data: 'yes' },
                        { text: 'No', callback_data: 'no' },
                    ],
                    [
                        { text: 'Main Menu', callback_data: 'mainMenu' },
                    ]
                ]
            }
        });
        else if (action === 'mainMenu') return backToMenu(ctx, 'main');
        else if (action === 'no') return backToMenu(ctx, 'settings');
        else {
            await ctx.reply('Please enter your wallet private key', goButton());
            return ctx.wizard.next();
        }
    },

    async (ctx) => {
        //step 2
        const action = ctx?.update?.callback_query?.data;
        if(action === 'cancel') return backToMenu(ctx, 'settings');

        const message = ctx?.message?.text;
        if (!message) await ctx.reply('Please enter your wallet private key', goButton());
        else if (message === '/start') return backToMenu(ctx, 'main');
        else {
            const privateKey = await encryptPrivateKey(message);
            if (!privateKey) return backToMenu(ctx, 'settings', 'Something Went wrong. Please try again later');
            else {
                const res = await updateUserData(ctx.from.id, { privateKey });
                if (!res.success) return backToMenu(ctx, 'settings', res.message);
                else {
                    store.update(ctx.from.id, res.data);
                    return backToMenu(ctx, 'settings', 'Private key successfully updated');
                }
            }
        }
    }

);



module.exports = updatePrivateKeyWizard;