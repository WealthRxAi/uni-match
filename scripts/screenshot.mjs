import { createServer } from 'http';
import { readFileSync, existsSync } from 'fs';
import { extname, join } from 'path';
import { chromium } from 'playwright-core';

const MIME = {'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.ico':'image/x-icon'};
const root = 'dist';
const srv = createServer((req,res)=>{
  let p = join(root, req.url.split('?')[0]);
  if (!existsSync(p) || p.endsWith('/')) p = join(root,'index.html');
  try { res.setHeader('content-type', MIME[extname(p)]||'application/octet-stream'); res.end(readFileSync(p)); }
  catch { res.writeHead(404); res.end(); }
});
await new Promise(r=>srv.listen(4173,r));

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const page = await browser.newPage({ viewport:{width:1440,height:900} });
await page.goto('http://localhost:4173', { waitUntil:'networkidle' });
await page.screenshot({ path:'recordings/shot-01-empty-state.png' });

// fill profile: GPA 3.6, interests CS + Economics
await page.fill('input[type="number"], input[inputmode], input[type="text"]', '3.6').catch(()=>{});
const chips = page.locator('button:has-text("Computer Science")');
if (await chips.count()) await chips.first().click();
const econ = page.locator('button:has-text("Economics")');
if (await econ.count()) await econ.first().click();
await page.screenshot({ path:'recordings/shot-02-profile-filled.png' });
const find = page.locator('button:has-text("Find")');
if (await find.count()) await find.first().click();
await page.waitForTimeout(1200);
await page.screenshot({ path:'recordings/shot-03-results.png', fullPage:false });
await page.screenshot({ path:'recordings/shot-04-results-full.png', fullPage:true });

// mobile
const m = await browser.newPage({ viewport:{width:390,height:844} });
await m.goto('http://localhost:4173', { waitUntil:'networkidle' });
await m.screenshot({ path:'recordings/shot-05-mobile.png' });
await browser.close(); srv.close();
console.log('SCREENSHOTS OK');
