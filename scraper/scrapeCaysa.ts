import { chromium, Page } from "playwright";
import type { ClubRecord } from "./scrapeSampleDirectory";

function clean(txt: string | null | undefined): string {
  if (!txt) return "";
  return txt.replace(/\s+/g, " ").trim();
}

type RawCaysaClub = {
  name: string;
  href: string | null;
  logoUrl: string | null;
};

// STEP 1: Scrape the member clubs grid
async function scrapeCaysaDirectory(page: Page, url: string): Promise<RawCaysaClub[]> {
  console.log(`Visiting CAYSA member clubs page: ${url}`);
  await page.goto(url, { waitUntil: "domcontentloaded" });

  const clubs = await page.$$eval("a", (anchors) => {
    type Result = { name: string; href: string | null; logoUrl: string | null };
    const results: Result[] = [];

    function findTileRoot(el: Element): Element {
      let cur: Element | null = el;
      for (let i = 0; i < 3 && cur && cur.parentElement; i++) {
        cur = cur.parentElement;
      }
      return cur || el;
    }

    anchors.forEach((a) => {
      const img = a.querySelector("img");
      if (!img) return;

      const tileRoot = findTileRoot(a);

      // Try to grab the visible label under the logo
      let bestName = "";
      tileRoot.querySelectorAll("p, div, span").forEach((el) => {
        const text = (el.textContent || "").trim();
        if (
          text &&
          text.length > 2 &&
          !/click on a club crest/i.test(text)
        ) {
          if (text.length > bestName.length) {
            bestName = text;
          }
        }
      });

      if (!bestName) return;

      results.push({
        name: bestName,
        href: a.getAttribute("href"),
        logoUrl: img.getAttribute("src"),
      });
    });

    // De-dupe on lowercase name
    const dedup = new Map<string, Result>();
    for (const r of results) {
      const key = r.name.toLowerCase();
      if (!dedup.has(key)) {
        dedup.set(key, r);
      }
    }

    return Array.from(dedup.values());
  });

  console.log(`[CAYSA] found ${clubs.length} raw clubs on directory page`);
  return clubs.map((c) => ({
    name: clean(c.name),
    href: c.href,
    logoUrl: c.logoUrl,
  }));
}

// STEP 2: Try to scrape each club's detail page for city / about / website
async function scrapeCaysaClubDetail(
  page: Page,
  baseUrl: string,
  href: string | null
) {
  if (!href) {
    return {
      city: "",
      website_url: "",
      about: "",
    };
  }

  // normalize URL
  const fullUrl = href.startsWith("http")
    ? href
    : new URL(href, baseUrl).toString();

  console.log(`CAYSA detail → ${fullUrl}`);

  // If it's obviously an external site (facebook.com, sportsengine-prelive, etc),
  // we won't try to deeply parse DOM (those love to redirect / block / auth).
  const isExternalHardSite = /facebook\.com|sportsengine|\.prelive|login|auth/i.test(
    fullUrl
  );

  if (isExternalHardSite) {
    // just return that URL as website_url
    return {
      city: "",
      website_url: fullUrl,
      about: "",
    };
  }

  // Otherwise, try to open it and extract some structured text.
  try {
    await page.goto(fullUrl, {
      waitUntil: "domcontentloaded",
      timeout: 8000, // ms
    });

    const detailTextBlocks = await page.$$eval("p, div, span, a, li", (els) =>
      els
        .map((el) => (el.textContent || "").trim())
        .filter((t) => !!t)
    );

    const websiteGuess =
      detailTextBlocks.find((t) => /^https?:\/\//i.test(t)) ||
      detailTextBlocks.find((t) => t.includes(".org") || t.includes(".com")) ||
      fullUrl;

    const cityGuess =
      detailTextBlocks.find((t) => /(,\s*TX\b|,\s*Texas\b)/i.test(t)) || "";

    const aboutGuess =
      detailTextBlocks
        .filter((t) => t.length > 60)
        .slice(0, 1)
        .join(" ") || "";

    return {
      city: clean(cityGuess),
      website_url: clean(websiteGuess),
      about: clean(aboutGuess),
    };
  } catch (err) {
    console.warn(`CAYSA detail scrape FAILED for ${fullUrl}:`, (err as any).message);

    // fallback: keep the URL as their website, leave the rest blank
    return {
      city: "",
      website_url: fullUrl,
      about: "",
    };
  }
}

export async function scrapeCaysa(): Promise<ClubRecord[]> {
  const browser = await chromium.launch({ headless: true });
  const listPage = await browser.newPage();
  const detailPage = await browser.newPage();

  const DIRECTORY_URL = "https://caysa.org/caysa-member-clubs/";
  const rawClubs = await scrapeCaysaDirectory(listPage, DIRECTORY_URL);

  const finalClubs: ClubRecord[] = [];

  for (const raw of rawClubs) {
    const detail = await scrapeCaysaClubDetail(detailPage, DIRECTORY_URL, raw.href);

    finalClubs.push({
      club_name: raw.name,
      city: detail.city || "",
      state: "TX",
      website_url: detail.website_url || "",
      tryout_info_url: undefined,
      ages: undefined,
      competition_level: undefined, // we'll enrich this manually/with tags later
      badge_logo_url: raw.logoUrl || undefined,
      about: detail.about || undefined,
      last_scraped_at: new Date().toISOString(),
    });
  }

  await browser.close();

  console.log(`[CAYSA] clubs: ${finalClubs.length}`);
  return finalClubs;
}
