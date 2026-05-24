import {
  cleanJsonResponse,
  getGeminiClient,
  getLatestCricketDataInstruction,
  getGeminiModelCandidates,
} from "./_shared.js";

function sendEvent(res: any, event: string, data: unknown) {
  res.write(`event: ${event}\n`);
  res.write(`data: ${JSON.stringify(data)}\n\n`);
}

function summarizeGeminiError(error: any) {
  const message =
    error?.error?.message ||
    error?.message ||
    (typeof error === "string" ? error : "Unknown Gemini error");
  const code = error?.status || error?.error?.code || error?.code || "unknown";

  return `Gemini ${code}: ${String(message).replace(/\s+/g, " ").slice(0, 220)}`;
}

async function askMatchupJson(ai: any, batter: string, bowler: string, venue: string) {
  let lastError: unknown = null;
  const models = getGeminiModelCandidates().slice(0, 2);

  const prompt = `Return ONLY valid raw JSON for this cricket matchup: ${batter} vs ${bowler}.
Venue context: ${venue}.

${getLatestCricketDataInstruction()}

Use known cricket records and latest publicly available T20/IPL context. Do not include markdown.
If exact recent-form scorecards are not confidently available, return an empty recentForm array instead of inventing match scores.

Required JSON shape:
{
  "isMock": false,
  "batter": {
    "name": "${batter}",
    "id": "bat_live",
    "imageUrl": null,
    "country": "Country",
    "role": "Batter",
    "t20Stats": {
      "matches": 0,
      "innings": 0,
      "runs": 0,
      "average": 0,
      "strikeRate": 0,
      "highestScore": "0",
      "fifties": 0,
      "hundreds": 0
    },
    "recentForm": []
  },
  "bowler": {
    "name": "${bowler}",
    "id": "bowl_live",
    "imageUrl": null,
    "country": "Country",
    "role": "Bowler",
    "t20Stats": {
      "matches": 0,
      "wickets": 0,
      "economy": 0,
      "average": 0,
      "bestFigures": "0/0"
    },
    "recentForm": []
  },
  "headToHead": {
    "dismissals": 0,
    "totalEncounters": 0,
    "batterStrikeRateVsBowler": 0,
    "lastEncounterResult": "One sentence summary or no live H2H data found."
  },
  "venue": {
    "name": "${venue}",
    "city": "Overall T20 sample",
    "avgT20Score": 170,
    "spinAdvantage": false,
    "dewFactor": true,
    "pitchDescription": "Short venue or neutral-context note."
  },
  "phase2": {
    "batterFormScore": 0,
    "batterFormTrend": "consistent",
    "bowlerThreatScore": 0,
    "bowlerThreatTrend": "consistent",
    "headToHead": {
      "dominance": "contested",
      "dominanceStrength": 50,
      "summary": "Short matchup summary."
    },
    "venue": {
      "venueAdjustment": 0,
      "venueNote": "Short venue note."
    },
    "phaseAnalysis": {
      "powerplayRisk": "medium",
      "middleOversRisk": "medium",
      "deathOversRisk": "medium",
      "bestAttackWindow": "Overs 16-20"
    },
    "highlights": ["Point one", "Point two", "Point three"],
    "overallRisk": "Contested",
    "riskScore": 50,
    "confidence": "medium"
  },
  "phase3": {
    "badge": { "label": "CONTESTED", "color": "amber", "emoji": "●" },
    "predictionText": "Plain English overview of the matchup.",
    "attackWindow": "Overs 16-20",
    "statCards": [
      { "label": "BATTER STRIKE RATE", "value": "0", "subtext": "Career", "highlight": true },
      { "label": "BOWLER ECONOMY", "value": "0", "subtext": "Career", "highlight": false },
      { "label": "HEAD-TO-HEAD", "value": "0 encounters", "subtext": "Historical", "highlight": false },
      { "label": "RISK SCORE", "value": "50", "subtext": "Out of 100", "highlight": false }
    ],
    "batterCard": { "name": "${batter}", "imageUrl": null, "role": "Batter", "formBadge": "🔥 In Form", "topStat": "SR: 0" },
    "bowlerCard": { "name": "${bowler}", "imageUrl": null, "role": "Bowler", "formBadge": "⚡ Inconsistent", "topStat": "Eco: 0" },
    "timeline": ["Data Fetched", "Stats Analyzed", "Venue Factored", "Verdict Generated"],
    "shareText": "${batter} vs ${bowler} | FormGuide",
    "generatedAt": "${new Date().toISOString()}"
  },
  "fetchedAt": "${new Date().toISOString()}"
}`;

  for (const model of models) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.2,
        },
      });

      return JSON.parse(cleanJsonResponse(response.text || ""));
    } catch (error) {
      lastError = error;
      console.warn(`Gemini matchup request failed for ${model}: ${summarizeGeminiError(error)}`);
    }
  }

  throw lastError;
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
      sendEvent(res, "error", {
        message: "GEMINI_API_KEY is missing. Live matchup analysis cannot be fetched.",
      });
      res.end();
      return;
    }

    sendEvent(res, "step", { stepIndex: 0, status: "active", message: `Fetching matchup data for ${batter}` });
    const data = await askMatchupJson(ai, batter, bowler, venue);

    sendEvent(res, "step", { stepIndex: 0, status: "done", message: `Processed batting profile for ${data.batter?.name || batter}` });
    sendEvent(res, "step", { stepIndex: 1, status: "done", message: `Processed bowling profile for ${data.bowler?.name || bowler}` });
    sendEvent(res, "step", { stepIndex: 2, status: "done", message: "Head-to-head processed" });
    sendEvent(res, "step", { stepIndex: 3, status: "done", message: "Venue context processed" });
    sendEvent(res, "step", { stepIndex: 6, status: "done", message: "Matchup intelligence compiled" });
    sendEvent(res, "step", { stepIndex: 7, status: "done", message: "Verdict compiled" });
    sendEvent(res, "complete", {
      ...data,
      isMock: false,
      fetchedAt: data.fetchedAt || new Date().toISOString(),
    });
    res.end();
  } catch (error) {
    console.error("Pipeline crashed", error);
    sendEvent(res, "error", {
      message: `Failed to generate matchup report before timeout. ${summarizeGeminiError(error)}`,
    });
    res.end();
  }
}
