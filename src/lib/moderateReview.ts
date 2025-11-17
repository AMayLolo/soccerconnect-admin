// src/lib/moderateReview.ts
import OpenAI from "openai";

export async function moderateReview(comment: string) {
  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY!,
  });

  try {
    const response = await client.moderations.create({
      model: "omni-moderation-latest",
      input: comment,
    });

    const results = response.results?.[0];

    if (!results) {
      return { flagged: false, hidden: false, reason: null };
    }

    const cat = results.categories;

    // LESS STRICT RULES (your choice):
    const harmful =
      cat.hate ||
      cat.harassment ||
      cat["sexual"] ||
      cat["self-harm"] ||
      false;

    if (harmful) {
      return {
        flagged: true,
        hidden: true,
        reason: "AI Moderation: Offensive or harmful content detected.",
      };
    }

    return { flagged: false, hidden: false, reason: null };
  } catch (err) {
    console.error("Moderation error", err);
    // Fail open (don’t block submission if moderation service breaks)
    return { flagged: false, hidden: false, reason: null };
  }
}
