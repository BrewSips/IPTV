const fs = require('fs');
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setUserAgent('AptvPlayer/1.4.16');

  try {
    // 先访问主页，模拟真实用户行为
    await page.goto('https://tv.iill.top', { waitUntil: 'networkidle2', timeout: 60000 });
    await new Promise(resolve => setTimeout(resolve, 3000)); // 等待 Cloudflare 验证通过

    // 再跳转到订阅地址
    await page.goto('https://tv.iill.top/m3u/Gather', { waitUntil: 'networkidle2', timeout: 60000 });

    // 提取页面内容
    const content = await page.evaluate(() => document.body.innerText);

    if (content.includes('#EXTINF')) {
      fs.writeFileSync('iptv.m3u', content);
      console.log('✅ IPTV playlist saved as iptv.m3u');
    } else {
      console.error('❌ Failed to fetch valid playlist. Cloudflare may still be blocking.');
      process.exit(1);
    }
  } catch (err) {
    console.error('❌ Error during fetch:', err);
    process.exit(1);
  }

  await browser.close();
})();
