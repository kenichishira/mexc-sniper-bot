const dotenv = require('dotenv');
const cron = require('node-cron');
const path = require('path');
const { ENV_MODE } = require('./config');
const connectDb = require('./db/connectDb');
const scraper = require('./scrapper/scrape.js');

const envPath = path.join(__dirname, `${ENV_MODE === 'prod' ? '.env.prod' : '.env.dev'}`);
dotenv.config({ path: envPath });


function scheduleTaskEveryHour() {
  cron.schedule('* * * * *', () => {
    scraper();
  });
}

async function app() {
  try {
    await connectDb();

    // scheduleTaskEveryHour();
    cron.schedule('* * * * *', () => {
      console.log('gellow')
    });

  } catch (error) {
    console.log('Error when start', error);
  }
}


app()