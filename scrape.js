const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36");
    await page.goto('https://uiverse.io/Darlley/lazy-seahorse-31', { waitUntil: 'networkidle2' });

    const content = await page.content();
    fs.writeFileSync('C:\\My portfolio\\p_dump.html', content);

    await browser.close();
    console.log("Done");
})();
