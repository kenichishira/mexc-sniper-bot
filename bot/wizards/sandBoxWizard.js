const { Scenes } = require('telegraf');
const store = require('../store');
const { backToMenu } = require('../utils/backToMenu');
const { validateToken } = require('../utils/ethersMethods');
const { createSnipe, updateUserData } = require('../../../service_dbOperations');



const sandBoxWizard = new Scenes.WizardScene(
    'sandBoxWizard',
    async (ctx) => {
        //step 0
        ctx.wizard.state.user = store.get(ctx.from.id);
        if (!ctx.wizard.state.user) return backToMenu(ctx, 'main', 'Something went wrong. Please try again later');
        ctx.wizard.state.buttons = [
            [
                { text: ctx.wizard.state.user.sandBox ? 'Disable' : 'Enable', callback_data: ctx.wizard.state.user.sandBox ? 'disable' : 'enable' },
                { text: 'Go Back', callback_data: 'goBack' }
            ],
            [
                { text: 'Main Menu', callback_data: 'mainMenu' }
            ]
        ]
        await ctx.replyWithHTML(`Sand Box : ${ctx.wizard.state.user.sandBox ? '<b>Enabled</b>' : '<b>Disabled</b>'}\n\nYou can Enable or Disable Sand Box. If you enable Sand Box then your future transaction will not took place in MainNet. To Make transaction in MainNet you must disable Sand Box.`, { reply_markup: { inline_keyboard: ctx.wizard.state.buttons } });

        return ctx.wizard.next();
    },
    async(ctx)=>{
        //step 1
        const message= ctx?.message?.text;
        if(message==='/start') return backToMenu(ctx, 'main');

        const action = ctx?.update?.callback_query?.data;
        if(!action) await ctx.replyWithHTML(`Sand Box : ${ctx.wizard.state.user.sandBox ? '<b>Enabled</b>' : '<b>Disabled</b>'}\n\nYou can Enable or Disable Sand Box. If you enable Sand Box then your future transaction will not took place in MainNet. To Make transaction in MainNet you must disable Sand Box.`, { reply_markup: { inline_keyboard: ctx.wizard.state.buttons } });
        else if(action==='goBack') return backToMenu(ctx, 'settings');
        else if(action==='enable' || action==='disable'){
            const res = await updateUserData(ctx.from.id, { sandBox: action==='enable'?true:false });
            if (!res.success){
                await ctx.reply('Something went wrong. Please try again later');
                return ctx.scene.reenter('sandBoxWizard');
            }
            else {
                store.update(ctx.from.id, res.data);
                return ctx.scene.reenter('sandBoxWizard');
            }
            

        }
        else return backToMenu(ctx, 'main');
    }


);

module.exports = sandBoxWizard;
