
const { Scenes } = require('telegraf');
const { backToMenu, goButton } = require('../utils/backToMenu');
const { updateUserData } = require('../../../service_dbOperations');
const store = require('../store');


const updateAmountWizard = new Scenes.WizardScene(
  'updateAmountWizard',
  async(ctx)=>{
    //step 0
    const user= store.get(ctx.from.id);
     if(!user) return backToMenu(ctx,'settings', 'Something went wrong. Please try again later');
     ctx.wizard.state.user=user;
    await ctx.replyWithHTML(`Your current <b>WETH Amount</b> is <b>${ctx.wizard.state.user.amountInETH}</b>. Do you want to update WETH Amount?`,{reply_markup: {
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
    return ctx.wizard.next()
  },
  async(ctx)=>{
    //step 1
    const message= ctx?.message?.text;
    if(message==='/start') return backToMenu(ctx, 'main');

    const action= ctx?.update?.callback_query?.data;
    if(!action)  await ctx.replyWithHTML(`Your current <b>WETH Amount</b> is <b>${ctx.wizard.state.user.amountInETH}</b>. Do you want to update WETH Amount?`,{reply_markup: {
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
    else if(action==='yes') {
      await ctx.reply('Please enter the WETH amount you want to snipe', goButton());
      return ctx.wizard.next();
    }
    else if(action==='no') return backToMenu(ctx, 'settings');
    else return backToMenu(ctx, 'main')
    
  }
  ,
  async(ctx)=>{
    //step 2
    const action= ctx?.update?.callback_query?.data;
    if(action === 'cancel') return backToMenu(ctx, 'settings');

    const message= ctx?.message?.text;
    if(!message)  await ctx.reply('Please enter the WETH amount you want to snipe', goButton());
    else if(message==='/start') return backToMenu(ctx, 'main');
    else if(message.startsWith('-') || isNaN(message)) await ctx.reply('Please enter a valid WETH amount', goButton());
    else {
        const res = await updateUserData(ctx.from.id,{amountInETH: message.toString()});
                if(!res.success) return backToMenu(ctx, 'settings', res.message);
                else{
                    store.update(ctx.from.id,res.data);
                    return backToMenu(ctx, 'settings', 'Amount (WETH) successfully updated');
                }
    }
  }
 
);


 
module.exports = updateAmountWizard;
