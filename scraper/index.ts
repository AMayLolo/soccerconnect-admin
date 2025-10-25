import { scrapeDirectory } from "./scrapeSampleDirectory";
import { saveClubs } from "./saveClubs";

async function main() {
  const SOURCE_URL = "https://www.ntxsoccer.org/competitive-member-clubs/";

  const clubs = await scrapeDirectory(SOURCE_URL);

  console.log("Scraped clubs:", clubs.length);
  console.dir(clubs, { depth: null });

  await saveClubs(clubs);
}

main()
  .then(() => {
    console.log("Done.");
  })
  .catch((err) => {
    console.error("Fatal:", err);
    process.exit(1);
  });
