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

// normalize text so it's not full of weird whitespace/newlines/bullets
function clean(txt: string | null | undefined): string {
  if (!txt) return "";
  return txt
    .replace(/\s+/g, " ")
    .replace(/·/g, " ")
    .trim();
}

/**
 * scrapeNTXClubsFromPage
 *
 * The North Texas Soccer "Competitive Member Clubs" page lists clubs like:
 *   - Dallas Texans
 *   - Solar Soccer Club
 *   - Sting Soccer Club
 *   - Steel United Texas
 *   - etc.
 *
 * We grab the whole main content area, split it into lines, filter for lines
 * that look like club names, drop obvious non-club headings, dedupe,
 * and turn that into ClubRecord objects.
 */
async function scrapeNTXClubsFromPage(page: Page): Promise<ClubRecord[]> {
  // 1. Pull text from the main content area
  const fullTextRaw = await page.evaluate(() => {
    const mainEl =
      document.querySelector("main") ||
      document.querySelector('[role="main"]') ||
      document.body;

    return mainEl?.textContent || "";
  });

  // 2. Split into lines and clean each one
  const lines = fullTextRaw
    .split("\n")
    .map((l) => clean(l))
    .filter((l) => l.length > 0);

  // 3. Heuristic filter to keep club-looking lines and drop page chrome
  const likelyClubLines = lines.filter((line) => {
    const lower = line.toLowerCase();

    // toss obvious non-club / nav / footer / boilerplate
    if (lower.includes("membership services")) return false;
    if (lower.includes("general information")) return false;
    if (lower.includes("youth")) return false;
    if (lower.includes("insurance")) return false;
    if (lower.includes("risk management")) return false;
    if (lower.includes("newsletter")) return false;
    if (lower.includes("©")) return false;
    if (lower.includes("all rights reserved")) return false;
    if (lower.includes("privacy policy")) return false;
    if (lower.includes("contact us")) return false;
    if (lower.includes("north texas soccer")) return false;
    if (lower.includes("state office")) return false;
    if (lower.includes("board of directors")) return false;
    if (lower.includes("coaches")) return false;
    if (lower.includes("referees")) return false;

    // throw away super short junk like "Close"
    if (line.length < 3) return false;

    // Heuristics that make something look like an actual competitive club:
    //  - 2+ words, or
    //  - contains common soccer terms / branding patterns
    const wordCount = line.split(" ").length;
    if (wordCount >= 2) return true;
    if (/\b(FC|SC)\b/i.test(line)) return true;
    if (/soccer/i.test(line)) return true;
    if (/united/i.test(line)) return true;
    if (/dallas/i.test(line)) return true;
    if (/sting/i.test(line)) return true;
    if (/solar/i.test(line)) return true;
    if (/premier/i.test(line)) return true;
    if (/academy/i.test(line)) return true;
    if (/futbol/i.test(line)) return true;
    if (/revolution/i.test(line)) return true;

    return false;
  });

  // 4. Dedupe (page content can echo)
  const uniqueNames = Array.from(new Set(likelyClubLines));

  // 5. Remove known non-club headings that showed up in scrape
  const blacklist = [
    "Adult Associations",
    "Indoor Centers",
    "TOPSoccer Associations",
    "International Clearance",
  ];

  const filteredNames = uniqueNames.filter(
    (name) => !blacklist.includes(name)
  );

  // 6. Convert to ClubRecord[]
  const clubs: ClubRecord[] = filteredNames.map((clubName) => {
    return {
      club_name: clubName,
      city: "", // not available from this page yet
      state: "TX", // North Texas Soccer
      website_url: "", // we'll enrich later
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

/**
 * scrapeDirectory
 * Wrapper that launches Chromium, visits the NTX page, and returns club records.
 */
export async function scrapeDirectory(url: string): Promise<ClubRecord[]> {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  console.log("Navigating to", url);
  await page.goto(url, { waitUntil: "domcontentloaded" });

  const clubs = await scrapeNTXClubsFromPage(page);

  await browser.close();
  return clubs;
}
