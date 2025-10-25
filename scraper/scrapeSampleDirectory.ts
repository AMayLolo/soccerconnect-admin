import { chromium, Page } from "playwright";

export type ClubRecord = {
  club_name: string;
  city: string;
  state: string;
  website_url: string;
  tryout_info_url?: string;
  ages?: string;
  competition_level?: string;
  badge_logo_url?: string;
  about?: string;
  last_scraped_at: string;
};

// tiny helper to clean text nodes
function clean(txt: string | null | undefined): string {
  if (!txt) return "";
  return txt
    .replace(/\s+/g, " ")
    .replace(/·/g, " ")
    .trim();
}

/**
 * scrapeNTXClubsFromPage:
 * The NTX page at https://www.ntxsoccer.org/competitive-member-clubs/
 * visually lists club names like:
 *   Dallas Surf
 *   Dallas Texans
 *   Solar Soccer Club
 *   Sting Soccer Club
 *   Steel United Texas
 * etc.  (source: North Texas Soccer competitive member clubs listing). :contentReference[oaicite:1]{index=1}
 *
 * We will:
 * - grab all text content inside the main content area
 * - split it into lines
 * - filter out junk, headers, empty lines
 * - dedupe
 */
async function scrapeNTXClubsFromPage(page: Page): Promise<ClubRecord[]> {
  // 1. get the whole main content text (we'll refine later if needed)
  const fullTextRaw = await page.evaluate(() => {
    // Try to find the main article/body area where the list lives.
    // Common patterns on these NTX pages use <main> or an element with role="main".
    const mainEl =
      document.querySelector("main") ||
      document.querySelector('[role="main"]') ||
      document.body;

    return mainEl?.textContent || "";
  });

  // 2. Split into lines
  const lines = fullTextRaw
    .split("\n")
    .map((l) => clean(l))
    .filter((l) => l.length > 0);

  // 3. Heuristic filter:
  // Keep lines that look like club names (words, maybe FC, SC, United, etc.)
  // Toss generic site text like "Membership Services", "NTX Soccer eNews", footer junk, etc.
  const likelyClubLines = lines.filter((line) => {
    const lower = line.toLowerCase();

    // toss obvious non-club sections
    if (lower.includes("membership services")) return false;
    if (lower.includes("general information")) return false;
    if (lower.includes("youth")) return false;
    if (lower.includes("insurance")) return false;
    if (lower.includes("risk management")) return false;
    if (lower.includes("newsletter")) return false;
    if (lower.includes("©")) return false;
    if (lower.includes("u.s. soccer")) return false;
    if (lower.includes("fifa")) return false;
    if (lower.includes("all rights reserved")) return false;
    if (lower.includes("privacy policy")) return false;
    if (lower.includes("contact us")) return false;
    if (lower.includes("north texas soccer")) return false;

    // throw away super short stuff ("Close")
    if (line.length < 3) return false;

    // This page shows clubs like "Dallas Surf", "Solar Soccer Club", "FC Dallas Youth", etc.
    // A quick heuristic: at least 2 words OR contains "FC"/"SC"/"Soccer"/"United"/"Dallas"
    const wordCount = line.split(" ").length;
    if (wordCount >= 2) return true;
    if (/\b(FC|SC)\b/i.test(line)) return true;
    if (/soccer/i.test(line)) return true;
    if (/dallas/i.test(line)) return true;
    if (/united/i.test(line)) return true;
    if (/sting/i.test(line)) return true;
    if (/solar/i.test(line)) return true;

    return false;
  });

  // 4. Dedupe (the page sometimes repeats nav or footer text)
  const uniqueNames = Array.from(new Set(likelyClubLines));

  // 5. Convert to ClubRecord[]
  const clubs: ClubRecord[] = uniqueNames.map((clubName) => {
    return {
      club_name: clubName,
      city: "", // NTX page doesn’t give city directly. We'll enrich later.
      state: "TX",
      website_url: "", // we'll enrich later with a follow-up scrape per club
      tryout_info_url: undefined,
      ages: undefined,
      competition_level: undefined,
      badge_logo_url: undefined,
      about: undefined,
      last_scraped_at: new Date().toISOString(),
    };
  });

  return clubs;
}

// Browser wrapper
export async function scrapeDirectory(url: string): Promise<ClubRecord[]> {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  console.log("Navigating to", url);
  await page.goto(url, { waitUntil: "domcontentloaded" });

  const clubs = await scrapeNTXClubsFromPage(page);

  await browser.close();
  return clubs;
}
