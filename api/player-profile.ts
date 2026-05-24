import { resolveProfile } from "./_shared";

export default async function handler(req: any, res: any) {
  const name = String(req.query.name || "").trim();

  if (!name) {
    res.status(400).json({ error: "Missing required query parameter: name" });
    return;
  }

  try {
    const profile = await resolveProfile(name);

    res.status(200).json({
      name,
      cricketDataAvailable: !!profile.cricketData,
      wikimediaAvailable: !!profile.wikimedia,
      profile: profile.profile,
    });
  } catch (error) {
    console.error("Player profile lookup failed", error);
    res.status(502).json({ error: "Player profile lookup failed" });
  }
}
