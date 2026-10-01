const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  page.on('pageerror', error => {
    console.log('PAGE ERROR:', error.message);
    console.log(error.stack);
  });
  page.on('console', msg => {
    if (msg.type() === 'error') console.log('CONSOLE ERROR:', msg.text());
  });
  await page.goto('http://localhost:3000/app');
  await new Promise(r => setTimeout(r, 2000));
  await browser.close();
})();
