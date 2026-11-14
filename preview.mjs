import { pathToFileURL } from 'node:url';
const { chromium } = await import(pathToFileURL('H:/Softmagic_ITO/ito-settings/node_modules/playwright/index.mjs').href);
const b = await chromium.launch();
for (const [n, w, h] of [['desk', 1366, 900], ['phone', 390, 844]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  await p.goto(pathToFileURL(process.cwd() + '/dist/index.html').href, { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(3000);
  await p.screenshot({ path: `preview-${n}.png`, fullPage: true });
  console.log(n, 'side scroll:', await p.evaluate(() => document.documentElement.scrollWidth > innerWidth));
  await p.goto(pathToFileURL(process.cwd() + '/dist/privacy.html').href, { waitUntil: 'domcontentloaded' });
  await p.screenshot({ path: `preview-privacy-${n}.png` });
}
await b.close();
