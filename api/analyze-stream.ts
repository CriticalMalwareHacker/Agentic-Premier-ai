import {
  cleanJsonResponse,
  enrichMatchupPlayers,
  GEMINI_MODEL,
  getGeminiClient,
  getSimulationData,
} from "./_shared.js";

function sendEvent(res: any, event: string, data: unknown) {
  res.write(`event: ${event}\n`);
  res.write(`data: ${JSON.stringify(data)}\n\n`);
}

async function askJson(ai: any, contents: string) {
  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      temperature: 0.2,
    },
  });

  return JSON.parse(cleanJsonResponse(response.text || ""));
}

export default async function handler(req: any, res: any) {
  const batter = String(req.query.batter || "Virat Kohli");
  const bowler = String(req.query.bowler || "Jasprit Bumrah");
  const venue = String(req.query.venue || "Overall T20 neutral venue context");

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");

  const ai = getGeminiClient();

  try {
    if (!ai) {
      sendEvent(res, "step", { stepIndex: 0, status: "active", message: `Fetching recent form for ${batter}` });
      const fallback = getSimulationData(batter, bowler, venue);
      sendEvent(res, "step", { stepIndex: 0, status: "done", message: `Loaded fallback stats for ${batter}` });
      sendEvent(res, "step", { stepIndex: 1, status: "done", message: `Loaded fallback stats for ${bowler}` });
      sendEvent(res, "step", { stepIndex: 2, status: "done", message: "Loaded fallback head-to-head data" });
      sendEvent(res, "step", { stepIndex: 3, status: "done", message: `Loaded pitch report for ${venue}` });
      sendEvent(res, "step", { stepIndex: 4, status: "active", message: "Resolving player faces" });
      const enriched = await enrichMatchupPlayers(fallback);
      sendEvent(res, "step", { stepIndex: 4, status: "done", message: "Player faces resolved" });
      sendEvent(res, "step", { stepIndex: 5, status: "done", message: "Verdict compiled" });
      sendEvent(res, "complete", enriched);
      res.end();
      return;
    }

    const fallback = getSimulationData(batter, bowler, venue);
    const finalData: any = {
      ...fallback,
      isMock: false,
      fetchedAt: new Date().toISOString(),
    };

    sendEvent(res, "step", { stepIndex: 0, status: "active", message: `Fetching T20/IPL stats for ${batter}` });
    try {
      finalData.batter = await askJson(ai, `Search current IPL/T20 stats and recent form for batter ${batter}. Return ONLY JSON matching this shape:
{"name":"${batter}","id":"bat_live","imageUrl":null,"country":"India/External","role":"Batter","t20Stats":{"matches":100,"innings":95,"runs":3000,"average":35,"strikeRate":140,"highestScore":"100*","fifties":20,"hundreds":2},"recentForm":[{"match":"Recent match","runs":40,"balls":25,"sr":160}]}`);
    } catch (error) {
      console.error("Batter lookup failed", error);
      finalData.batter = fallback.batter;
    }
    sendEvent(res, "step", { stepIndex: 0, status: "done", message: `Processed stats for ${finalData.batter.name}` });

    sendEvent(res, "step", { stepIndex: 1, status: "active", message: `Fetching T20/IPL stats for ${bowler}` });
    try {
      finalData.bowler = await askJson(ai, `Search current IPL/T20 stats and recent bowling form for bowler ${bowler}. Return ONLY JSON matching this shape:
{"name":"${bowler}","id":"bowl_live","imageUrl":null,"country":"India/External","role":"Bowler","t20Stats":{"matches":100,"wickets":120,"economy":7.2,"average":22,"bestFigures":"4/20"},"recentForm":[{"match":"Recent match","overs":4,"runs":28,"wickets":2,"economy":7}]}`);
    } catch (error) {
      console.error("Bowler lookup failed", error);
      finalData.bowler = fallback.bowler;
    }
    sendEvent(res, "step", { stepIndex: 1, status: "done", message: `Processed stats for ${finalData.bowler.name}` });

    sendEvent(res, "step", { stepIndex: 2, status: "active", message: `Analyzing ${batter} vs ${bowler}` });
    try {
      finalData.headToHead = await askJson(ai, `Find T20/IPL head-to-head matchup stats for ${batter} against ${bowler}. Return ONLY JSON:
{"dismissals":2,"totalEncounters":8,"batterStrikeRateVsBowler":120,"lastEncounterResult":"One sentence recap"}`);
    } catch (error) {
      console.error("Head-to-head lookup failed", error);
      finalData.headToHead = fallback.headToHead;
    }
    sendEvent(res, "step", { stepIndex: 2, status: "done", message: "Head-to-head processed" });

    sendEvent(res, "step", { stepIndex: 3, status: "active", message: `Reading pitch report for ${venue}` });
    try {
      finalData.venue = await askJson(ai, `Evaluate T20 pitch conditions at ${venue}. Return ONLY JSON:
{"name":"${venue}","city":"City","avgT20Score":165,"spinAdvantage":true,"dewFactor":true,"pitchDescription":"Detailed pitch report"}`);
    } catch (error) {
      console.error("Venue lookup failed", error);
      finalData.venue = fallback.venue;
    }
    sendEvent(res, "step", { stepIndex: 3, status: "done", message: "Venue processed" });

    sendEvent(res, "step", { stepIndex: 4, status: "done", message: "Matchup intelligence compiled" });
    sendEvent(res, "step", { stepIndex: 5, status: "active", message: "Resolving CricketData profiles and faces" });
    const enriched = await enrichMatchupPlayers(finalData);
    sendEvent(res, "step", { stepIndex: 5, status: "done", message: "Verdict compiled" });
    sendEvent(res, "complete", enriched);
    res.end();
  } catch (error) {
    console.error("Pipeline crashed", error);
    sendEvent(res, "error", { message: "Failed to generate matchup report" });
    res.end();
  }
}
