const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', error => console.log('PAGE ERROR:', error.message));

    await page.goto('file://C:/Users/m00663436/.gemini/antigravity/scratch/battery_simulation.html');

    // wait for vue
    await page.waitForSelector('#app');

    // type into loanA
    await page.type('input[placeholder="例: 10000"]', '10000');

    // click submit
    await page.click('button.bg-secondary');

    // wait a bit
    await new Promise(r => setTimeout(r, 2000));

    console.log("DONE");
    await browser.close();
})();
