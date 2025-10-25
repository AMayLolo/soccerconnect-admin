import { saveClubs } from "./saveClubs";
import { scrapeCaysa } from "./scrapeCaysa"; // Central Texas (CAYSA)
import { scrapeECNL } from "./scrapeECNL"; // ECNL Boys/Girls
import { scrapeDirectory } from "./scrapeSampleDirectory"; // NTX (North Texas Soccer)

function normalizeKey(name: string) {
  return name.trim().toLowerCase();
}

async function main() {
  // 1. NTX
  const NTX_URL = "https://www.ntxsoccer.org/competitive-member-clubs/";
  console.log("Navigating to", NTX_URL);
  const ntxClubs = await scrapeDirectory(NTX_URL);
  console.log("[NTX] clubs:", ntxClubs.length);

  // 2. ECNL
  const ecnlClubs = await scrapeECNL();
  console.log("[ECNL] clubs:", ecnlClubs.length);

  // 3. CAYSA
  const caysaClubs = await scrapeCaysa();
  console.log("[CAYSA] clubs:", caysaClubs.length);

  // 4. Merge all three sources
  const merged = new Map<string, any>();

  function mergeIn(list: any[]) {
    for (const c of list) {
      const key = normalizeKey(c.club_name);
      if (merged.has(key)) {
        const prev = merged.get(key);

        merged.set(key, {
          ...prev,
          city: prev.city || c.city || "",
          state: prev.state || c.state || "",
          website_url: prev.website_url || c.website_url || "",
          tryout_info_url: prev.tryout_info_url || c.tryout_info_url,
          ages: prev.ages || c.ages,
          badge_logo_url: prev.badge_logo_url || c.badge_logo_url,
          about: prev.about || c.about,
          // upgrade competition_level if the new record has it
          competition_level:
            prev.competition_level || c.competition_level || undefined,
          last_scraped_at: new Date().toISOString(),
        });
      } else {
        merged.set(key, {
          ...c,
          last_scraped_at: new Date().toISOString(),
        });
      }
    }
  }

  mergeIn(ntxClubs);
  mergeIn(ecnlClubs);
  mergeIn(caysaClubs);

  const finalClubs = Array.from(merged.values());

  console.log("[FINAL MERGED] total unique clubs:", finalClubs.length);
  console.dir(finalClubs.slice(0, 15), { depth: null });

  // 5. Save back to Supabase
  await saveClubs(finalClubs);
  console.log("Saved", finalClubs.length, "clubs to Supabase");
  console.log("Done.");
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
