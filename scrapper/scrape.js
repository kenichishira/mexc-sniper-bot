const puppeteer = require('puppeteer-extra');
// const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const randomUseragent = require('random-useragent');

// puppeteer.use(StealthPlugin());
const waitFor = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function scrapeNewestTokens() {
  let browser;
  try {
    browser = await puppeteer.launch({ headless: false, args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,1080'] });
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 1080 });
    await page.setUserAgent(randomUseragent.getRandom());

    await page.goto('https://www.google.com/', { waitUntil: 'networkidle2', timeout: 100000 });
    await waitFor(Math.random() * 2000 + 1000);

    await page.type('input[name="q"]', 'MEXC New Listings');
    await page.keyboard.press('Enter');
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    await waitFor(Math.random() * 2000 + 1000);

    await page.evaluate(async () => {
      for (let i = 0; i < 5; i++) {
        window.scrollBy(0, window.innerHeight / 3);
        await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));
      }
    });

    const mexcLinkSelector = 'h3, a.fuLhoc';
    await page.waitForSelector(mexcLinkSelector);
    const links = await page.$$(mexcLinkSelector);
    const mexcLink = await Promise.all(links.map(async (link) => {
      const text = await page.evaluate(el => el.innerText, link);
      return text.toLowerCase()?.includes('mexc new listing calendar') ? link : null;
    })).then(results => results.find(link => link));

    await waitFor(Math.random() * 2000 + 1000);

    if (mexcLink) {
      await mexcLink.click();
      await page.waitForNavigation({ waitUntil: 'networkidle2' });
    } else {
      console.error('MEXC New Listing Calendar link not found in search results');
      return;
    }

    // Scrape name and listing time
    const listings = await page.$$eval('.card_container___xZkC', cards => {
      return cards.map(card => {
        const name = card.querySelector('.name.card_withEllipsis__pZ_OY')?.innerText || 'N/A';
        const listingTime = card.querySelector('.time.card_value__Q83Tj')?.innerText || 'N/A';
        const introduction = card.querySelector('.introduction.card_value__Q83Tj.card_withEllipsis__pZ_OY')?.innerText || 'N/A';
        return { name, listingTime: listingTime.replace(' ', 'T'), introduction };
      });
    });
    return listings;
  } catch (error) {
    console.error('An error occurred:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

module.exports = { scrapeNewestTokens };