import { createServer } from 'http';
import { readFileSync, existsSync } from 'fs';
import { extname, join } from 'path';
import { chromium } from 'playwright-core';

const MIME = {'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.png':'image/png'};
const srv = createServer((req,res)=>{
  let p = join('dist', req.url.split('?')[0]);
  if (!existsSync(p) || p.endsWith('/')) p = join('dist','index.html');
  try { res.setHeader('content-type', MIME[extname(p)]||'application/octet-stream'); res.end(readFileSync(p)); }
  catch { res.writeHead(404); res.end(); }
});
await new Promise(r=>srv.listen(4173,r));

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const ctx = await browser.newContext({ viewport:{width:1440,height:900}, recordVideo:{ dir:'recordings/demo-raw', size:{width:1440,height:900} } });
const page = await ctx.newPage();
const slow = async (ms)=>page.waitForTimeout(ms);

await page.goto('http://localhost:4173', { waitUntil:'networkidle' }); await slow(2000);

// Type GPA slowly like a human
const gradeInput = page.locator('input').first();
await gradeInput.click(); await slow(600);
await gradeInput.pressSequentially('3.6', { delay: 220 }); await slow(900);

// pick interests
await page.locator('button:has-text("Computer Science")').first().click(); await slow(700);
await page.locator('button:has-text("Economics")').first().click(); await slow(900);

// find matches
await page.locator('button:has-text("Find my matches")').first().click(); await slow(2500);

// scroll through results
for (let i=0;i<6;i++){ await page.mouse.wheel(0,450); await slow(650); }
await page.mouse.wheel(0,-2800); await slow(1200);

// use region filter
const europe = page.locator('button:has-text("Europe")').first();
if (await europe.count()) { await europe.click(); await slow(1800); }

// tuition slider drag
const sliders = page.locator('input[type="range"]');
if (await sliders.count()) {
  await sliders.first().focus();
  for (let i=0;i<14;i++){ await page.keyboard.press('ArrowLeft'); await slow(90); }
  await slow(1600);
}
for (let i=0;i<4;i++){ await page.mouse.wheel(0,420); await slow(600); }
await slow(1500);
await ctx.close(); await browser.close(); srv.close();
console.log('DEMO RECORDED');
