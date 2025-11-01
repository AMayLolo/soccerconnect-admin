const { chromium } = require('playwright');

(async () => {
  const base = process.env.BASE_URL || 'http://localhost:3000';
  const paths = ['/login', '/protected'];
  const out = {};

  const browser = await chromium.launch();
  const page = await browser.newPage();

  for (const p of paths) {
    const url = base + p;
    out[p] = { url };
    try {
      const resp = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
      if (resp) {
        out[p].ssrStatus = resp.status();
        try {
          out[p].ssrHtml = (await resp.text()).slice(0, 5000);
        } catch (e) {
          out[p].ssrHtml = `ERROR reading response.text(): ${String(e)}`;
        }
      }

      // Wait for client JS to run
      await page.waitForLoadState('networkidle');
      out[p].hydratedHtml = (await page.content()).slice(0, 5000);

      // Collect computed styles and SVG geometry
      out[p].computed = await page.evaluate(() => {
        const el = document.querySelector('.site-logo');
        const svg = document.querySelector('.site-logo svg');
        const cs = el ? getComputedStyle(el) : null;
        const rect = svg ? svg.getBoundingClientRect() : null;
        const sheets = Array.from(document.styleSheets).map(s => s.href).filter(Boolean);
        return {
          found: !!el,
          outerHTML: el ? el.outerHTML.slice(0, 2000) : null,
          computed: cs
            ? {
                width: cs.width,
                height: cs.height,
                display: cs.display,
                minHeight: cs.minHeight,
                overflow: cs.overflow,
                position: cs.position,
              }
            : null,
          svgRect: rect ? { width: rect.width, height: rect.height, top: rect.top, left: rect.left } : null,
          styleHrefs: sheets,
        };
      });

      // Fetch the stylesheet texts (same-origin only)
      out[p].styleSheets = {};
      for (const href of out[p].computed.styleHrefs) {
        try {
          const text = await page.evaluate(async (h) => {
            const r = await fetch(h, { cache: 'no-store' });
            return await r.text();
          }, href);
          out[p].styleSheets[href] = {
            length: text.length,
            contains_h_12: text.includes('.h-12'),
            contains_h_full: text.includes('.h-full'),
            snippet: text.slice(0, 2000),
          };
        } catch (e) {
          out[p].styleSheets[href] = { error: String(e) };
        }
      }
    } catch (e) {
      out[p].error = String(e);
    }
  }

  console.log(JSON.stringify(out, null, 2));
  await browser.close();
  process.exit(0);
})();
