const { Scenes } = require('telegraf');
const { goBack, backToMenu } = require('../utils/backToMenu');
const store = require('../store');
const { getJobs, createMarketSell, sellChannel, deleteManyJobs } = require('../../../service_dbOperations');
const { formateDate } = require('../utils/formateDate');
const { fetchCurrentPrice } = require('../utils/ethersMethods');


const successfulJobWizard = new Scenes.WizardScene(
  'successfulJobWizard',
  async(ctx)=>{
    //step 0
    ctx.wizard.state.user = store.get(ctx.from.id);
    if(!ctx.wizard.state.user) return goBack(ctx, 'liquidity', 'Something went wrong. Please try again later');
    else {
      const res = await getJobs.successful(ctx.wizard.state.user._id.toString());
      if(!res.success) return goBack(ctx, 'liquidity', res.message);
      else {
        if(res.data.length===0) return goBack(ctx, 'liquidity', 'You have no successful job');
        else {
          ctx.wizard.state.jobs=res.data;
          const buttons = res.data.map(j=>({text:j.tokenName+' ('+ j.tokenSymbol+') | '+ j.amountInETH+ ' WETH |'+ formateDate(j.createdAt), callback_data:j._id.toString()}));
          buttons.push({text:'Delete All Successful Job', callback_data:'cancelAll'},{text:'Go Back', callback_data:'mainMenu'});
          const buttonsRows = [];
          while (buttons.length) {
            buttonsRows.push(buttons.splice(0, 1));
          }
          ctx.wizard.state.buttons=buttonsRows;
          await ctx.replyWithHTML('<b>Successful Jobs List</b>', {reply_markup: { inline_keyboard: ctx.wizard.state.buttons}});
          return ctx.wizard.next();
        }
      }
    }
  },

  async(ctx)=>{
    //step 1
    const message= ctx?.message?.text;
    if(message==='/start') return backToMenu(ctx, 'main');

    const action = ctx?.update?.callback_query?.data;
    if(!action) await ctx.replyWithHTML('<b>Successful Jobs List</b>', {reply_markup: { inline_keyboard: ctx.wizard.state.buttons}});
    else if(action==='cancelAll'){
      cancelJobs(ctx.wizard.state.jobs);
      return goBack(ctx, 'liquidity', 'Jobs will be deleted soon. Please check later');
    }
    else if (action === 'mainMenu') {
      return goBack(ctx, 'liquidity');
    }
    else {
      ctx.wizard.state.selected = ctx.wizard.state.jobs.find(j=>j._id.toString()===action);
      if(!ctx.wizard.state.selected) return goBack(ctx, 'liquidity', 'Something went wrong. PLease try again later');
      else {
         
        let msg=`<b>Job Details</b>\n\nToken: ${ctx.wizard.state.selected.tokenName} (${ctx.wizard.state.selected.tokenSymbol})\nToken Address: ${ctx.wizard.state.selected.tokenAddress}\nBuy Amount: ${ctx.wizard.state.selected.amountInETH} WETH\nToken Received: ${ctx.wizard.state.selected.receivedToken} ${ctx.wizard.state.selected.tokenSymbol}\n`;

        const market_buy_subjob= ctx.wizard.state.selected.subjobs.find(sj=>sj.type==='marketBuy');
        const sell_subjob= ctx.wizard.state.selected.subjobs.find(sj=>sj.type!=='marketBuy');
        msg+=`Buying Price: ${ctx.wizard.state.selected.buying_price} WETH\nBuy Tnx Hash: https://etherscan.io/tx/${market_buy_subjob.txHash}\n`
        if(sell_subjob){
          msg+=`Selling Price : ${ctx.wizard.state.selected.selling_price} WETH\nWETH Received: ${ctx.wizard.state.selected.receivedWETH} WETH\nSell Tnx Hash: https://etherscan.io/tx/${sell_subjob.txHash}`
        }
        ctx.wizard.state.msg=msg
        if(ctx.wizard.state.selected.subjobs.length===1) ctx.wizard.state.buttons=[[{text:'Sell Token', callback_data:'sellToken'}, {text:'Delete Job', callback_data:'cancel'}],[{text:'Go Back', callback_data:'mainMenu'}]];
        else ctx.wizard.state.buttons=[[{text:'Delete Job', callback_data:'cancel'}, {text:'Go Back', callback_data:'mainMenu'}]]
        await ctx.replyWithHTML(ctx.wizard.state.msg,{reply_markup:{inline_keyboard:ctx.wizard.state.buttons}});
        return ctx.wizard.next();
      }
    }
  },
  async(ctx)=>{
    //step 2
    const message= ctx?.message?.text;
    if(message==='/start') return backToMenu(ctx, 'main');
    
    const action = ctx?.update?.callback_query?.data;
    if(!action)  await ctx.replyWithHTML(ctx.wizard.state.msg,{reply_markup:{inline_keyboard:ctx.wizard.state.buttons}});
    else if(action==='sellToken') {
      //sell
      sellToken(ctx);
      return goBack(ctx, 'liquidity', 'Sell initiated. Please check in a while for update');
    }
    else if(action==='cancel'){
      //delete
      cancelJobs([ctx.wizard.state.selected]);
      return goBack(ctx, 'liquidity', 'Jobs will be deleted soon. Please check later');
    }
    else return ctx.scene.reenter('successfulJobWizard');
  }
 
);


const sellToken= async(ctx)=>{
  try {

    const sellData= await createMarketSell(ctx.wizard.state.selected);
    const selling_price= await fetchCurrentPrice(sellData.job.tokenAddress);
    sellData.selling_price=selling_price;
      sellChannel.publishMessage(sellData);
    
  } catch (error) {
    console.log('Error from sell token function in successful job wizard : ', error);
    
  }
}

const cancelJobs = async(jobs)=>{
  try {
    jobs.forEach(async job=>{
      await deleteManyJobs({table:'Job', query:{ _id: job._id.toString()}});
      job.subjobs.forEach(async sj=>{
        await deleteManyJobs({table:'SubJob', query:{ _id: sj._id.toString()}});
  
      })
  
    })
    
  } catch (error) {
    console.log('Error from cancelJobs function in successful jobs');
    
  }
}

 
module.exports = successfulJobWizard;