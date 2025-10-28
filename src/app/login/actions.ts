const isProd = process.env.NODE_ENV === "production";

const baseOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: (isProd ? "none" : "lax") as "none" | "lax",
  path: "/",
  // 🔹 remove domain in dev; only set it in prod
  ...(isProd ? { domain: ".soccerconnectusa.com" } : {}),
};
