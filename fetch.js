const fs = require('fs');
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  await page.setUserAgent('AptvPlayer/1.4.16');
  await page.goto('https://tv.iill.top/m3u/Gather', { waitUntil: 'networkidle2' });

  const content = await page.content();

  if (content.includes('#EXTINF')) {
    fs.writeFileSync('iptv.m3u', content);
    console.log('✅ IPTV playlist saved.');
  } else {
    console.error('❌ Failed to fetch valid playlist. Cloudflare may still be blocking.');
    process.exit(1);
  }

  await browser.close();
})();
