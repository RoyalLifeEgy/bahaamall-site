// Screenshots of docs/ on desktop and phone: node preview.mjs
import { pathToFileURL } from 'node:url';
const { chromium } = await import(pathToFileURL('H:/Softmagic_ITO/ito-settings/node_modules/playwright/index.mjs').href);
const b = await chromium.launch();
for (const [n, w, h] of [['desk', 1440, 900], ['phone', 390, 844]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  for (const page of ['index', 'privacy']) {
    await p.goto(pathToFileURL(process.cwd() + `/docs/${page}.html`).href, { waitUntil: 'networkidle' });
    await p.evaluate(async () => { await document.fonts.ready; for (let y = 0; y < document.body.scrollHeight; y += 400) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); } scrollTo(0, 0); document.querySelectorAll('.rv').forEach((e) => e.classList.add('in')); });
    await p.waitForTimeout(1500);
    await p.screenshot({ path: `preview-${page}-${n}.png`, fullPage: true });
    console.log(n, page, 'side scroll:', await p.evaluate(() => document.documentElement.scrollWidth > innerWidth));
  }
}
await b.close();
