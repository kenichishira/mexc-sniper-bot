const { Scenes } = require('telegraf');
const store = require('../store');
const { getJobs, deleteManyJobs, updateJob, createMarketSell } = require('../../../service_dbOperations');
const { backToMenu, goBack } = require('../utils/backToMenu');
const { formateDate } = require('../utils/formateDate');
const { killPriceMonitorChannel, sellChannel } = require('../../../service_dbOperations/src/app');
const { fetchCurrentPrice } = require('../utils/ethersMethods');
const menu = require('../menu');


const runningJobWizard = new Scenes.WizardScene(
  'runningJobWizard',
  async (ctx) => {
    //step 0
    ctx.wizard.state.user = store.get(ctx.from.id);
    if (!ctx.wizard.state.user) return goBack(ctx, 'liquidity', 'Something went wrong. Please try again later');
    else {
      const res = await getJobs.running(ctx.wizard.state.user._id.toString());
      if (!res.success) return goBack(ctx, 'liquidity', res.message);
      else {
        if (res.data.length === 0) return goBack(ctx, 'liquidity', 'You have no running job');
        else {
          ctx.wizard.state.jobs = res.data;
          const buttons = res.data.map(j => ({ text: j.tokenName + ' (' + j.tokenSymbol + ') | ' + j.amountInETH + ' WETH |' + formateDate(j.createdAt), callback_data: j._id.toString() }));
          buttons.push({ text: 'Cancel All Running Job', callback_data: 'cancelAll' }, { text: 'Go Back', callback_data: 'mainMenu' });
          const buttonsRows = [];
          while (buttons.length) {
            buttonsRows.push(buttons.splice(0, 1));
          }
          ctx.wizard.state.buttons = buttonsRows;
          await ctx.replyWithHTML('<b>Running Jobs List</b>', { reply_markup: { inline_keyboard: ctx.wizard.state.buttons } });
          return ctx.wizard.next();
        }
      }

    }
  },


  async (ctx) => {
    //step 1
    const message= ctx?.message?.text;
    if(message==='/start') return backToMenu(ctx, 'main');

    const action = ctx?.update?.callback_query?.data;
    if (!action) await ctx.replyWithHTML('<b>Running Jobs List</b>', { reply_markup: { inline_keyboard: ctx.wizard.state.buttons } });
    else if (action === 'cancelAll') {
      //calcel all jobs and delete all jobs
      cancelJobs(ctx.wizard.state.jobs);
      return goBack(ctx, 'liquidity', 'Jobs will be cancelled soon. Please check later')
    }
    else if (action === 'mainMenu') {
      return goBack(ctx, 'liquidity')
    }
    else {
      ctx.wizard.state.selected = ctx.wizard.state.jobs.find(j => j._id.toString() === action);
      if (!ctx.wizard.state.selected) return goBack(ctx, 'liquidity', 'Something went wrong. Please try again later');
      else {
        const stopLoss = ctx.wizard.state.selected.subjobs.find(s => s.type === 'stopLoss');
        const takeProfit = ctx.wizard.state.selected.subjobs.find(s => s.type === 'takeProfit');
        ctx.wizard.state.stopLoss = stopLoss;
        ctx.wizard.state.takeProfit = takeProfit;
        ctx.wizard.state.msg = `<b>Job Details</b>\n\nToken Name: ${ctx.wizard.state.selected.tokenName} (${ctx.wizard.state.selected.tokenSymbol})\nToken Address: ${ctx.wizard.state.selected.tokenAddress}\nBuy Amount: ${ctx.wizard.state.selected.amountInETH} WETH\nToken Received: ${ctx.wizard.state.selected.receivedToken} ${ctx.wizard.state.selected.tokenSymbol}\nBuying Price: ${ctx.wizard.state.selected.buying_price} WETH\nBuy tnx Hash: https://etherscan.io/tx/${ctx.wizard.state.selected.marketBuyData.txHash}\n`;
        if (stopLoss) ctx.wizard.state.msg += `Stop Loss Percentage: ${ctx.wizard.state.selected.low}\n`;
        if (takeProfit) ctx.wizard.state.msg += `Take Profit Percentage: ${ctx.wizard.state.selected.peak}\n`;
        ctx.wizard.state.buttons = [
          [{ text: 'Sell Token', callback_data: 'sellToken' },
          { text: 'Delete Job', callback_data: 'deleteJob' }
          ],
          [
            { text: 'Mark as Complete', callback_data: 'completeJob' },
            { text: 'Go Back', callback_data: 'goBack' }
          ],
          [
            { text: 'Main Menu', callback_data: 'mainMenu' }
          ]
        ]
        await ctx.replyWithHTML(ctx.wizard.state.msg, { reply_markup: { inline_keyboard: ctx.wizard.state.buttons } });
        return ctx.wizard.next();
      }

    }
  },
  async (ctx) => {
    //step 2
    const message= ctx?.message?.text;
    if(message==='/start') return backToMenu(ctx, 'main');

    const action = ctx?.update?.callback_query?.data;
    if (!action) await ctx.replyWithHTML(ctx.wizard.state.msg, { reply_markup: { inline_keyboard: ctx.wizard.state.buttons } });
    else if (action === 'goBack') return ctx.scene.reenter('runningJobWizard');
    else if (action === 'deleteJob') {
      cancelJobs([ctx.wizard.state.selected]);
      return goBack(ctx, 'liquidity', 'Job will be deleted soon. Please check later');
    }
    else if (action === 'completeJob') {
      makeJobCompleted(ctx);
      return goBack(ctx, 'liquidity', 'Job will be marked as completed soon. Please check again in a while for confirmation.')
    }
    else if (action === 'sellToken') {
      sellToken(ctx);
      return goBack(ctx, 'liquidity', 'Sell Initiated. Please check again in while for confirmation')
    }
    else return goBack(ctx, 'liquidity');

  }


);
const sellToken = async (ctx) => {
  try {
    const subjobs_type = [];
    const sellData = await createMarketSell(ctx.wizard.state.selected);
    if (!sellData) return console.log('Error: failed to create market sell');
    if (ctx.wizard.state.stopLoss) {
      subjobs_type.push('stopLoss');
      await deleteManyJobs({ table: 'SubJob', query: { _id: { $in: [ctx.wizard.state.stopLoss._id.toString()] } } });
      killPriceMonitorChannel.publishMessage(ctx.wizard.state.stopLoss);
    }

    if (ctx.wizard.state.takeProfit) {
      subjobs_type.push('takeProfit');
      await deleteManyJobs({ table: 'SubJob', query: { _id: { $in: [ctx.wizard.state.takeProfit._id.toString()] } } });
      killPriceMonitorChannel.publishMessage(ctx.wizard.state.takeProfit);
    }
    const selling_price= await fetchCurrentPrice(sellData.job.tokenAddress);
    console.log({selling_price});
    sellChannel.publishMessage({ ...sellData, metadata: { subjobs_type, jobId: ctx.wizard.state.selected._id.toString() },selling_price });
    console.log('Sell Channel called....');
   


  } catch (error) {
    console.log('Eror In sellToken function from running job wizard: ', error);

  }
}

const makeJobCompleted = async (ctx) => {
 try {
  const filteredSubJobs = ctx.wizard.state.selected.subjobs.filter(s => s.type !== 'marketBuy');
  filteredSubJobs.forEach(async sj => {
    await deleteManyJobs({ table: 'SubJob', query: { _id: { $in: [sj._id.toString()] } } });
    killPriceMonitorChannel.publishMessage(sj);
  });
  updateJob(ctx.wizard.state.selected._id.toString(), { completed: true })
  
 } catch (error) {
  console.log('Error from make jon completed function in runningjob wizard:', error);
  
 }

}
const cancelJobs = async (jobs) => {
try {
  jobs.forEach(async job => {
    job.subjobs.forEach(async subJob => {
      await deleteManyJobs({ table: 'SubJob', query: { _id: { $in: [subJob._id.toString()] } } });
      killPriceMonitorChannel.publishMessage(subJob);
    })
    await deleteManyJobs({ table: 'Job', query: { _id: { $in: [job._id.toString()] } } });

  });

  
} catch (error) {
  console.log('Error in cancel jon function in running job wizard: ', error);
}

}



module.exports = runningJobWizard;