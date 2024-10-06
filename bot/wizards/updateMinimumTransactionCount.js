const { Scenes } = require('telegraf');
const { backToMenu, goButton } = require('../utils/backToMenu');
const store = require('../store');
const { updateUserData } = require('../../../service_dbOperations');


const minimumTransactionCount = new Scenes.WizardScene(
  'minimumTransactionCount',
  async(ctx)=>{
     //step 0
     const user= store.get(ctx.from.id);
     if(!user) return backToMenu(ctx,'settings', 'Something went wrong. Please try again later');
     ctx.wizard.state.user=user;
     if(!ctx.wizard.state.user.minimumTransactionCount) {
        await ctx.reply('You did to update transaction count per hour yet. Do you want to update this?',{reply_markup: {
        inline_keyboard: [
          [
            { text: 'Yes', callback_data: 'yes' },
            { text: 'No', callback_data: 'no' },
        ],
        [
            { text: 'Main Menu', callback_data: 'mainMenu' },
        ]
        ]
      }});
      ctx.wizard.next();}
      else {
        await ctx.replyWithHTML(`Your current transaction count per hour is <b>${user.minimumTransactionCount}</b>. Do you want to update this value?`, {reply_markup: {
            inline_keyboard: [
              [
                { text: 'Yes', callback_data: 'yes' },
                { text: 'No', callback_data: 'no' },
            ],
            [
                { text: 'Main Menu', callback_data: 'mainMenu' },
            ]
            ]
          }});
          ctx.wizard.next();
      }
  },


  async(ctx)=>{
    //step 1
    const message= ctx?.message?.text;
    if(message==='/start') return backToMenu(ctx, 'main');

    const action = ctx?.update?.callback_query?.data;
    if(!action) await ctx.replyWithHTML('Do you want to update Minimum transaction count per hour value?', {reply_markup: {
        inline_keyboard: [
          [
            { text: 'Yes', callback_data: 'yes' },
            { text: 'No', callback_data: 'no' },
        ],
        [
            { text: 'Main Menu', callback_data: 'mainMenu' },
        ]
        ]
      }});
      else if(action==='mainMenu') return backToMenu(ctx, 'main');
      else if(action==='no') return backToMenu(ctx, 'settings');
      else {
        await ctx.reply('Please enter the valid number?', {reply_markup: {
          inline_keyboard: [
          [
              { text: 'Cancel', callback_data: 'settings' },
          ]
          ]
        }});
        return ctx.wizard.next();
      }
  },
  async(ctx)=>{
    //step 2
    const action = ctx?.update?.callback_query?.data;
    if(action === 'settings') return backToMenu(ctx, 'settings');
    else if(action === 'cancel') return backToMenu(ctx, 'settings');

    const message = ctx?.message?.text;
    if(message==='/start') return backToMenu(ctx, 'main');
    else if(message.endsWith('%') || message.startsWith('-') || isNaN(message)) await ctx.reply('Please enter a valid positive number.', goButton());
    else {
        const res = await updateUserData(ctx.from.id,{minimumTransactionCount: Number(message)});
        if(!res.success) return backToMenu(ctx, 'settings', res.message);
        else {
          store.update(ctx.from.id,res.data);
          return backToMenu(ctx, 'settings', 'Minimum transaction count per hour value successfully updated.');
        }
    }
  }
 
);


 
module.exports = minimumTransactionCount;
