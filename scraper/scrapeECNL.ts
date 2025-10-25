import { chromium } from "playwright";
import type { ClubRecord } from "./scrapeSampleDirectory";

/**
 * Turn stuff like:
 *   "Solar SC ECNL B13"
 *   "Solar SC ECNL RL B14"
 *   "Lonestar SC Pre-ECNL B12"
 * into just the club name we care about:
 *   "Solar SC"
 *   "Lonestar SC"
 *
 * We'll chop at the first occurrence of " Pre-ECNL", " ECNL RL", or " ECNL".
 * Order matters: longest tokens first.
 */
function parseClubName(raw: string): string {
  const t = raw.trim();

  const cutTokens = [" Pre-ECNL", " ECNL RL", " ECNL"];
  for (const token of cutTokens) {
    const idx = t.toUpperCase().indexOf(token.toUpperCase());
    if (idx >= 0) {
      return t.slice(0, idx).trim();
    }
  }

  return t;
}

/**
 * Scrape ONE ECNL standings-ish page (boys, girls, RL, Pre, etc.)
 *
 * We target table rows where:
 *  - there's at least 2 <td>s
 *  - the 2nd cell has actual text ("Solar SC ECNL B13 ...")
 *  - we ignore header-like rows ("TEAMS", etc.)
 *
 * We grab:
 *  - raw team text (before "Qualification:")
 *  - crest/logo URL <img src="...">
 *  - normalize into a ClubRecord with a given competition tier label
 */
async function scrapeOnePage(
  url: string,
  competitionLabel: string // e.g. "ECNL Boys", "ECNL RL Girls", "Pre-ECNL Boys"
): Promise<ClubRecord[]> {
  console.log(`Scraping ECNL table: ${competitionLabel} -> ${url}`);

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto(url, { waitUntil: "domcontentloaded" });

  // Pull rows from any table that appears near the content.
  // We’re intentionally loose (h1 + * table, h1 + table, table) so we still catch it.
  const rows = await page.$$eval(
    "h1 + * table tr, h1 + table tr, table tr",
    (trs) => {
      const out: { teamText: string; logoUrl: string | null }[] = [];

      trs.forEach((tr) => {
        const tds = Array.from(tr.querySelectorAll("td"));
        if (tds.length < 2) return;

        const teamCell = tds[1];

        // textContent usually looks like:
        // "Solar SC ECNL B13 \nQualification: Champions League 6"
        let rawText = (teamCell.textContent || "").trim();
        if (!rawText) return;

        // ignore blatantly header-like rows
        const lower = rawText.toLowerCase();
        if (lower.includes("teams") && lower.includes("pos")) {
          return;
        }
        if (lower === "teams" || lower.startsWith("teams")) {
          return;
        }

        // cut off "Qualification:" and everything after it
        const qIdx = lower.indexOf("qualification");
        if (qIdx >= 0) {
          rawText = rawText.slice(0, qIdx).trim();
        }

        if (!rawText) return;

        // crest/logo
        const img = teamCell.querySelector("img");
        const logoUrl = img ? img.getAttribute("src") : null;

        out.push({
          teamText: rawText,
          logoUrl,
        });
      });

      return out;
    }
  );

  await browser.close();

  // Deduplicate within this page by normalized club name
  const clubMap = new Map<string, ClubRecord>();

  for (const row of rows) {
    const clubName = parseClubName(row.teamText);
    if (!clubName) continue;

    const key = clubName.toLowerCase();

    if (!clubMap.has(key)) {
      clubMap.set(key, {
        club_name: clubName,
        city: "",
        state: "", // we can enrich later from other sources (NTX/CAYSA)
        website_url: "",
        tryout_info_url: undefined,
        ages: undefined,
        competition_level: competitionLabel,
        badge_logo_url: row.logoUrl || undefined,
        about: undefined,
        last_scraped_at: new Date().toISOString(),
      });
    } else {
      // already saw this club on this page:
      const existing = clubMap.get(key)!;

      // if no badge yet and we have one now, keep it
      if (!existing.badge_logo_url && row.logoUrl) {
        existing.badge_logo_url = row.logoUrl;
      }

      // (competition_level stays whatever this page's label is;
      // every row on this page is same label anyway)
      clubMap.set(key, existing);
    }
  }

  return Array.from(clubMap.values());
}

/**
 * Scrape ALL ECNL tiers:
 *  - ECNL Boys
 *  - ECNL RL Boys
 *  - Pre-ECNL Boys
 *  - ECNL Girls
 *  - ECNL RL Girls
 *  - Pre-ECNL Girls
 *
 * Then merge them into a single list of unique clubs.
 * If a club shows up in multiple tiers, we'll merge competition_level strings.
 */
export async function scrapeECNL(): Promise<ClubRecord[]> {
  // Boys URLs
  const boysECNLUrl =
    "https://theecnl.com/sports/2023/8/8/ECNLB_0808235537.aspx";
  const boysRLUrl =
    "https://theecnl.com/sports/2023/8/8/ECNLRLB_0808230006.aspx";
  const boysPreUrl =
    "https://theecnl.com/sports/2023/8/8/Pre-ECNLB_0808231942.aspx";

  // Girls URLs
  const girlsECNLUrl =
    "https://theecnl.com/sports/2023/8/8/ECNLG_0808235831.aspx";
  const girlsRLUrl =
    "https://theecnl.com/sports/2023/8/8/ECNLRLG_0808235427.aspx";
  const girlsPreUrl =
    "https://theecnl.com/sports/2023/8/8/Pre-ECNLG_0808230733.aspx";

  // Scrape all 6 in parallel
  const [
    boysECNL,
    boysRL,
    boysPre,
    girlsECNL,
    girlsRL,
    girlsPre,
  ] = await Promise.all([
    scrapeOnePage(boysECNLUrl, "ECNL Boys"),
    scrapeOnePage(boysRLUrl, "ECNL RL Boys"),
    scrapeOnePage(boysPreUrl, "Pre-ECNL Boys"),
    scrapeOnePage(girlsECNLUrl, "ECNL Girls"),
    scrapeOnePage(girlsRLUrl, "ECNL RL Girls"),
    scrapeOnePage(girlsPreUrl, "Pre-ECNL Girls"),
  ]);

  // Merge by normalized club name
  const merged = new Map<string, ClubRecord>();
  const allLists = [
    boysECNL,
    boysRL,
    boysPre,
    girlsECNL,
    girlsRL,
    girlsPre,
  ];

  for (const list of allLists) {
    for (const club of list) {
      const key = club.club_name.toLowerCase();

      if (!merged.has(key)) {
        merged.set(key, { ...club });
      } else {
        const existing = merged.get(key)!;

        // merge competition levels into a combined string
        if (club.competition_level) {
          const levels = new Set(
            (existing.competition_level || "")
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          );
          levels.add(club.competition_level);
          existing.competition_level = Array.from(levels).join(", ");
        }

        // fill badge if we didn't already have one
        if (!existing.badge_logo_url && club.badge_logo_url) {
          existing.badge_logo_url = club.badge_logo_url;
        }

        merged.set(key, existing);
      }
    }
  }

  const clubs = Array.from(merged.values());
  console.log(`[ECNL] clubs: ${clubs.length}`);
  return clubs;
}
