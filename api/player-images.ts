import { resolveProfile } from "./_shared.js";

export default async function handler(req: any, res: any) {
  const batter = String(req.query.batter || "").trim();
  const bowler = String(req.query.bowler || "").trim();

  if (!batter || !bowler) {
    res.status(400).json({ error: "Missing batter or bowler query parameter." });
    return;
  }

  try {
    const [batterProfile, bowlerProfile] = await Promise.all([
      resolveProfile(batter),
      resolveProfile(bowler),
    ]);

    res.status(200).json({
      batter: {
        cricketDataAvailable: !!batterProfile.cricketData,
        wikimediaAvailable: !!batterProfile.wikimedia,
        profile: batterProfile.profile,
      },
      bowler: {
        cricketDataAvailable: !!bowlerProfile.cricketData,
        wikimediaAvailable: !!bowlerProfile.wikimedia,
        profile: bowlerProfile.profile,
      },
    });
  } catch (error) {
    console.error("Player image lookup failed", error);
    res.status(502).json({ error: "Player image lookup failed." });
  }
}
