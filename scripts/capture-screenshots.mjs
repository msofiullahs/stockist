import puppeteer from 'puppeteer';
import { mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const BASE = process.env.BASE_URL || 'http://127.0.0.1:8123';
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = resolve(ROOT, 'screenshots');

const pages = [
  { name: '01-login', path: '/login', skipAuth: true },
  { name: '02-dashboard', path: '/dashboard' },
  { name: '03-products-list', path: '/products' },
  { name: '04-product-show', path: '/products/1' },
  { name: '05-product-create', path: '/products/create' },
  { name: '06-categories', path: '/categories' },
  { name: '07-suppliers', path: '/suppliers' },
  { name: '08-warehouses', path: '/warehouses' },
  { name: '09-stock-movements', path: '/stock-movements' },
  { name: '10-stock-movement-create', path: '/stock-movements/create' },
  { name: '11-stock-adjustments', path: '/stock-adjustments' },
  { name: '12-purchase-orders', path: '/purchase-orders' },
  { name: '13-purchase-order-create', path: '/purchase-orders/create' },
  { name: '14-stock-report', path: '/reports/stock' },
  { name: '15-movement-report', path: '/reports/movements' },
  { name: '16-users', path: '/users' },
  { name: '17-settings-general', path: '/settings/general' },
  { name: '18-settings-translations', path: '/settings/translations' },
  { name: '19-profile-edit', path: '/profile' },
  { name: '20-profile-password', path: '/profile/password' },
];

async function settle(page, ms = 350) {
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
  await new Promise((r) => setTimeout(r, ms));
}

const main = async () => {
  await mkdir(OUT, { recursive: true });

  const browser = await puppeteer.launch({
    headless: 'new',
    defaultViewport: { width: 1440, height: 900, deviceScaleFactor: 2 },
  });

  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(30000);

  // Capture login first (no auth)
  await page.goto(BASE + '/login', { waitUntil: 'networkidle2' });
  await settle(page);
  await page.screenshot({ path: resolve(OUT, '01-login.png'), fullPage: false });
  console.log('✓ 01-login');

  // Log in via the React form (use Inertia's useForm path: click Admin, submit form)
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find((b) => b.innerText.trim() === 'Admin');
    if (btn) btn.click();
  });
  await settle(page, 150);
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle2' }),
    page.evaluate(() => document.querySelector('form').requestSubmit()),
  ]);
  await settle(page);

  for (const p of pages.slice(1)) {
    try {
      await page.goto(BASE + p.path, { waitUntil: 'networkidle2' });
      await settle(page, 500);
      await page.screenshot({ path: resolve(OUT, `${p.name}.png`), fullPage: false });
      console.log('✓', p.name);
    } catch (err) {
      console.warn('✗', p.name, '-', err.message);
    }
  }

  await browser.close();
  console.log('\nDone. Saved to', OUT);
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
