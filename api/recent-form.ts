import {
  cleanJsonResponse,
  getGeminiClient,
  getGeminiModelCandidates,
} from "./_shared.js";

function summarizeGeminiError(error: any) {
  const message =
    error?.error?.message ||
    error?.message ||
    (typeof error === "string" ? error : "Unknown Gemini error");
  const code = error?.status || error?.error?.code || error?.code || "unknown";

  return `Gemini ${code}: ${String(message).replace(/\s+/g, " ").slice(0, 220)}`;
}

async function askRecentFormJson(ai: any, batter: string, bowler: string) {
  let lastError: unknown = null;
  const models = getGeminiModelCandidates().slice(0, 2);
  const prompt = `Return ONLY valid raw JSON for recent T20/IPL form.

Batter: ${batter}
Bowler: ${bowler}

Use public/searchable cricket records only. Do not invent match names or scorecards.
If exact recent innings or spells are not confidently available, return an empty array for that player.

Required JSON shape:
{
  "batter": {
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
    "recentForm": [
      { "match": "Team A vs Team B, competition/date if known", "runs": 0, "balls": 0, "sr": 0 }
    ]
  },
  "bowler": {
    "t20Stats": {
      "matches": 0,
      "wickets": 0,
      "economy": 0,
      "average": 0,
      "bestFigures": "0/0"
    },
    "recentForm": [
      { "match": "Team A vs Team B, competition/date if known", "overs": 0, "runs": 0, "wickets": 0, "economy": 0 }
    ]
  },
  "sourceNote": "Short note on what data was found."
}`;

  for (const model of models) {
    const attempts = [
      { tools: [{ googleSearch: {} }], temperature: 0.1 },
      { responseMimeType: "application/json", temperature: 0.1 },
    ];

    for (const config of attempts) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config,
        });

        return JSON.parse(cleanJsonResponse(response.text || ""));
      } catch (error) {
        lastError = error;
        console.warn(`Recent form request failed for ${model}: ${summarizeGeminiError(error)}`);
      }
    }
  }

  throw lastError;
}

export default async function handler(req: any, res: any) {
  const batter = String(req.query.batter || "").trim();
  const bowler = String(req.query.bowler || "").trim();

  if (!batter || !bowler) {
    res.status(400).json({ error: "Missing batter or bowler query parameter." });
    return;
  }

  const ai = getGeminiClient();
  if (!ai) {
    res.status(503).json({ error: "GEMINI_API_KEY is missing. Recent form cannot be fetched." });
    return;
  }

  try {
    const data = await askRecentFormJson(ai, batter, bowler);
    res.status(200).json(data);
  } catch (error) {
    console.error("Recent form lookup failed", error);
    res.status(502).json({ error: `Recent form lookup failed. ${summarizeGeminiError(error)}` });
  }
}
