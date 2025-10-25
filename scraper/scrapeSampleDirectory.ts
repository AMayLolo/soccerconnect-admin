import { chromium, Page } from "playwright";

// Shape of the club data we want to save
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

// normalize text so it's not full of weird whitespace/newlines
function clean(txt: string | null | undefined): string {
  if (!txt) return "";
  return txt.trim().replace(/\s+/g, " ");
}

// This function scrapes all the club "cards" on the page and turns them
// into ClubRecord objects. You will update the selectors once we target a real site.
async function scrapeDirectoryPage(page: Page): Promise<ClubRecord[]> {
  // grab every DOM element that represents a single club card/row
  const clubCards = await page.$$(".club-card");

  const results: ClubRecord[] = [];

  for (const card of clubCards) {
    // club name
    const club_name = clean(
      await card
        .$eval(".club-name", (el: Element) => el.textContent)
        .catch(() => "")
    );

    // location string, like "Naperville, IL"
    const locationRaw = clean(
      await card
        .$eval(".club-location", (el: Element) => el.textContent)
        .catch(() => "")
    );

    let city = "";
    let state = "";
    if (locationRaw.includes(",")) {
      const parts = locationRaw.split(",").map((p) => p.trim());
      city = parts[0] || "";
      state = parts[1] || "";
    } else {
      city = locationRaw;
      state = "";
    }

    // main website
    const website_url =
      (await card
        .$eval(
          ".club-website a",
          (el: Element) => (el as HTMLAnchorElement).href
        )
        .catch(() => "")) || "";

    // tryout / ID camp / placement info link (optional)
    const tryout_info_url =
      (await card
        .$eval(
          ".tryout-link a",
          (el: Element) => (el as HTMLAnchorElement).href
        )
        .catch(() => "")) || "";

    // age range (ex: "U7-U19")
    const ages = clean(
      await card
        .$eval(".age-range", (el: Element) => el.textContent)
        .catch(() => "")
    );

    // competitive levels (ex: "ECNL, MLS NEXT")
    const competition_level = clean(
      await card
        .$eval(".levels", (el: Element) => el.textContent)
        .catch(() => "")
    );

    // marketing blurb / about
    const about = clean(
      await card
        .$eval(".description", (el: Element) => el.textContent)
        .catch(() => "")
    );

    // club crest / logo
    const badge_logo_url =
      (await card
        .$eval(
          "img.club-logo",
          (el: Element) => (el as HTMLImageElement).src
        )
        .catch(() => "")) || "";

    results.push({
      club_name,
      city,
      state,
      website_url,
      tryout_info_url: tryout_info_url || undefined,
      ages: ages || undefined,
      competition_level: competition_level || undefined,
      badge_logo_url: badge_logo_url || undefined,
      about: about || undefined,
      last_scraped_at: new Date().toISOString(),
    });
  }

  return results;
}

// Launch browser, scrape that page, return the array of clubs
export async function scrapeDirectory(url: string): Promise<ClubRecord[]> {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  console.log("Navigating to", url);
  await page.goto(url, { waitUntil: "domcontentloaded" });

  const clubs = await scrapeDirectoryPage(page);

  await browser.close();
  return clubs;
}
