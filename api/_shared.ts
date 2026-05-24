import { GoogleGenAI } from "@google/genai";
import type { BatterInfo, BowlerInfo, MatchupAnalysis } from "../src/types";

export const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-1.5-flash";
const CRICKETDATA_KEY_NAMES = ["CRICKETDATA_API_KEY", "CRICAPI_KEY", "CRICAPI_API_KEY"];

type PlayerProfile = {
  id?: string;
  name?: string;
  country?: string;
  role?: string;
  imageUrl?: string | null;
};

type CricketDataPlayer = {
  id?: string;
  name?: string;
  country?: string;
  role?: string;
  playerImg?: string;
};

type CricketDataResponse<T> = {
  data?: T;
};

type MediaWikiPage = {
  index?: number;
  title?: string;
  pageprops?: { disambiguation?: string };
  thumbnail?: { source?: string };
};

export function isRealEnvValue(value: string | undefined, placeholders: string[] = []) {
  if (!value) return false;

  const normalized = value.trim();
  return normalized.length > 0 && !placeholders.includes(normalized);
}

export function getFirstEnvValue(names: string[], placeholders: string[] = []) {
  for (const name of names) {
    const value = process.env[name];
    if (isRealEnvValue(value, placeholders)) {
      return value!.trim();
    }
  }

  return null;
}

export function getGeminiClient() {
  const apiKey = getFirstEnvValue(["GEMINI_API_KEY"], ["MY_GEMINI_API_KEY"]);
  return apiKey ? new GoogleGenAI({ apiKey }) : null;
}

export function getCricketDataKey() {
  return getFirstEnvValue(CRICKETDATA_KEY_NAMES, ["MY_CRICKETDATA_API_KEY", "MY_CRICAPI_KEY"]);
}

export function cleanJsonResponse(raw: string) {
  let cleaned = raw.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.substring(7);
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.substring(3);
  }
  if (cleaned.endsWith("```")) {
    cleaned = cleaned.substring(0, cleaned.length - 3);
  }
  return cleaned.trim();
}

async function fetchJson<T>(url: string, timeoutMs = 8000): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "FormGuide/1.0",
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} from ${new URL(url).hostname}`);
    }

    return (await response.json()) as T;
  } finally {
    clearTimeout(timeout);
  }
}

function isUsableImageUrl(imageUrl?: string | null) {
  return !!imageUrl && !/\/icon512\.(png|jpg|jpeg|webp)$/i.test(imageUrl);
}

function chooseBestPlayerMatch(players: CricketDataPlayer[], playerName: string) {
  const normalizedName = playerName.toLowerCase();

  return (
    players.find((player) => player.name?.toLowerCase() === normalizedName) ||
    players.find((player) => player.name?.toLowerCase().includes(normalizedName)) ||
    players.find((player) => normalizedName.includes(player.name?.toLowerCase() || "")) ||
    players[0] ||
    null
  );
}

async function fetchCricketDataProfile(playerName: string): Promise<PlayerProfile | null> {
  const apiKey = getCricketDataKey();
  if (!apiKey) return null;

  const searchUrl = new URL("https://api.cricapi.com/v1/players");
  searchUrl.searchParams.set("apikey", apiKey);
  searchUrl.searchParams.set("offset", "0");
  searchUrl.searchParams.set("search", playerName);

  const searchResult = await fetchJson<CricketDataResponse<CricketDataPlayer[]>>(searchUrl.toString());
  const player = chooseBestPlayerMatch(searchResult.data || [], playerName);
  if (!player?.id) return null;

  const infoUrl = new URL("https://api.cricapi.com/v1/players_info");
  infoUrl.searchParams.set("apikey", apiKey);
  infoUrl.searchParams.set("offset", "0");
  infoUrl.searchParams.set("id", player.id);

  const infoResult = await fetchJson<CricketDataResponse<CricketDataPlayer>>(infoUrl.toString());
  const details = infoResult.data || player;

  return {
    id: details.id || player.id,
    name: details.name || player.name,
    country: details.country || player.country,
    role: details.role || player.role,
    imageUrl: isUsableImageUrl(details.playerImg) ? details.playerImg! : null,
  };
}

function pickMediaWikiPage(pages: Record<string, MediaWikiPage> | undefined, playerName: string) {
  const normalizedName = playerName.toLowerCase();

  return Object.values(pages || {})
    .filter((page) => !page.pageprops?.disambiguation && isUsableImageUrl(page.thumbnail?.source))
    .sort((a, b) => {
      const titleA = a.title?.toLowerCase() || "";
      const titleB = b.title?.toLowerCase() || "";
      const scoreA = (titleA.includes(normalizedName) ? 2 : 0) + (titleA.includes("cricketer") ? 1 : 0);
      const scoreB = (titleB.includes(normalizedName) ? 2 : 0) + (titleB.includes("cricketer") ? 1 : 0);

      return scoreB - scoreA || (a.index || 99) - (b.index || 99);
    })[0];
}

async function fetchWikimediaPortrait(playerName: string): Promise<PlayerProfile | null> {
  const searchUrl = new URL("https://en.wikipedia.org/w/api.php");
  searchUrl.searchParams.set("action", "query");
  searchUrl.searchParams.set("format", "json");
  searchUrl.searchParams.set("generator", "search");
  searchUrl.searchParams.set("gsrsearch", `${playerName} cricketer`);
  searchUrl.searchParams.set("gsrlimit", "4");
  searchUrl.searchParams.set("prop", "pageimages|pageprops");
  searchUrl.searchParams.set("pithumbsize", "320");
  searchUrl.searchParams.set("pilicense", "any");
  searchUrl.searchParams.set("redirects", "1");
  searchUrl.searchParams.set("origin", "*");

  const result = await fetchJson<{ query?: { pages?: Record<string, MediaWikiPage> } }>(searchUrl.toString());
  const page = pickMediaWikiPage(result.query?.pages, playerName);
  if (!page?.thumbnail?.source) return null;

  return {
    name: page.title,
    imageUrl: page.thumbnail.source,
  };
}

export async function resolveProfile(playerName: string) {
  const [cricketDataResult, wikimediaResult] = await Promise.allSettled([
    fetchCricketDataProfile(playerName),
    fetchWikimediaPortrait(playerName),
  ]);

  const cricketData = cricketDataResult.status === "fulfilled" ? cricketDataResult.value : null;
  const wikimedia = wikimediaResult.status === "fulfilled" ? wikimediaResult.value : null;

  return {
    cricketData,
    wikimedia,
    profile: {
      id: cricketData?.id || null,
      name: cricketData?.name || playerName,
      country: cricketData?.country || null,
      role: cricketData?.role || null,
      imageUrl: cricketData?.imageUrl || wikimedia?.imageUrl || null,
      imageSource: cricketData?.imageUrl ? "cricketdata" : wikimedia?.imageUrl ? "wikimedia" : null,
    },
  };
}

export async function enrichPlayerProfile<T extends BatterInfo | BowlerInfo>(player: T): Promise<T> {
  const { cricketData, wikimedia } = await resolveProfile(player.name);

  return {
    ...player,
    id: cricketData?.id || player.id,
    name: cricketData?.name || player.name,
    country: cricketData?.country || player.country,
    role: cricketData?.role || player.role,
    imageUrl: cricketData?.imageUrl || wikimedia?.imageUrl || player.imageUrl || null,
  };
}

export async function enrichMatchupPlayers<T extends MatchupAnalysis>(matchup: T): Promise<T> {
  const [batter, bowler] = await Promise.all([
    enrichPlayerProfile(matchup.batter),
    enrichPlayerProfile(matchup.bowler),
  ]);

  return {
    ...matchup,
    batter,
    bowler,
    phase3: matchup.phase3
      ? {
          ...matchup.phase3,
          batterCard: { ...matchup.phase3.batterCard, name: batter.name, role: batter.role, imageUrl: batter.imageUrl },
          bowlerCard: { ...matchup.phase3.bowlerCard, name: bowler.name, role: bowler.role, imageUrl: bowler.imageUrl },
        }
      : matchup.phase3,
  };
}

export function getSimulationData(rawBatter: string, rawBowler: string, venueInput: string): MatchupAnalysis {
  const batterName = rawBatter.trim() || "Virat Kohli";
  const bowlerName = rawBowler.trim() || "Jasprit Bumrah";
  const venueName = venueInput.trim() || "Chidambaram Stadium, Chennai";
  const isKohli = batterName.toLowerCase().includes("virat") || batterName.toLowerCase().includes("kohli");
  const isBumrah = bowlerName.toLowerCase().includes("jasprit") || bowlerName.toLowerCase().includes("bumrah");

  return {
    isMock: true,
    batter: {
      name: batterName,
      id: "bat_101",
      imageUrl: null,
      country: "India",
      role: "Batter",
      t20Stats: {
        matches: 385,
        innings: 368,
        runs: isKohli ? 12420 : 8940,
        average: isKohli ? 41.5 : 32.8,
        strikeRate: isKohli ? 138.2 : 142.5,
        highestScore: isKohli ? "122*" : "105",
        fifties: isKohli ? 95 : 54,
        hundreds: isKohli ? 9 : 3,
      },
      recentForm: [
        { match: "RCB vs MI", runs: isKohli ? 72 : 45, balls: isKohli ? 48 : 31, sr: isKohli ? 150.0 : 145.1 },
        { match: "RCB vs KKR", runs: isKohli ? 18 : 64, balls: isKohli ? 14 : 40, sr: isKohli ? 128.5 : 160.0 },
        { match: "RCB vs CSK", runs: isKohli ? 51 : 12, balls: isKohli ? 34 : 11, sr: isKohli ? 150.0 : 109.1 },
        { match: "RCB vs SRH", runs: isKohli ? 92 : 38, balls: isKohli ? 50 : 25, sr: isKohli ? 184.0 : 152.0 },
        { match: "RCB vs RR", runs: isKohli ? 44 : 2, balls: isKohli ? 29 : 6, sr: isKohli ? 151.7 : 33.3 },
      ],
    },
    bowler: {
      name: bowlerName,
      id: "bowl_202",
      imageUrl: null,
      country: "India",
      role: "Bowler",
      t20Stats: {
        matches: 275,
        wickets: isBumrah ? 328 : 242,
        economy: isBumrah ? 6.42 : 7.85,
        average: isBumrah ? 18.9 : 24.3,
        bestFigures: isBumrah ? "5/10" : "4/18",
      },
      recentForm: [
        { match: "MI vs RCB", overs: 4, runs: isBumrah ? 18 : 32, wickets: isBumrah ? 3 : 1, economy: isBumrah ? 4.5 : 8.0 },
        { match: "MI vs CSK", overs: 4, runs: isBumrah ? 24 : 28, wickets: isBumrah ? 1 : 2, economy: isBumrah ? 6.0 : 7.0 },
        { match: "MI vs KKR", overs: 4, runs: isBumrah ? 15 : 31, wickets: isBumrah ? 4 : 0, economy: isBumrah ? 3.75 : 7.75 },
        { match: "MI vs SRH", overs: 4, runs: isBumrah ? 38 : 42, wickets: isBumrah ? 1 : 1, economy: isBumrah ? 9.5 : 10.5 },
      ],
    },
    headToHead: {
      dismissals: isKohli && isBumrah ? 4 : 2,
      totalEncounters: isKohli && isBumrah ? 16 : 8,
      batterStrikeRateVsBowler: isKohli && isBumrah ? 122.5 : 115.8,
      lastEncounterResult: isKohli && isBumrah
        ? "Jasprit Bumrah bowled Virat Kohli with an in-swinging yorker in the 15th over"
        : `${bowlerName} limited ${batterName} to singles in their recent encounter.`,
    },
    venue: {
      name: venueName,
      city: venueName.includes("Chennai") ? "Chennai" : "Mumbai",
      avgT20Score: venueName.includes("Chennai") ? 162 : 178,
      spinAdvantage: venueName.includes("Chennai"),
      dewFactor: true,
      pitchDescription: venueName.includes("Chennai")
        ? "Typically slow and dry pitch with assistance for spinners. Grip and turn increases in the second innings, though dew can help batting later."
        : "A fast-scoring surface with a quick outfield and shorter boundary options. Dew usually supports chasing.",
    },
    phase2: {
      batterFormScore: 85,
      batterFormTrend: "rising",
      bowlerThreatScore: 78,
      bowlerThreatTrend: "consistent",
      headToHead: {
        dominance: "contested",
        dominanceStrength: 50,
        summary: "An evenly balanced duel where pitch and phase of innings decide the advantage.",
      },
      venue: {
        venueAdjustment: 10,
        venueNote: "Dew can make batting easier later in the innings.",
      },
      phaseAnalysis: {
        powerplayRisk: "high",
        middleOversRisk: "medium",
        deathOversRisk: "high",
        bestAttackWindow: "Overs 16-20",
      },
      highlights: [
        "Batter accelerates well when pace is predictable.",
        "Bowler is most dangerous with yorkers and cutters.",
        "Venue conditions slightly favor disciplined bowling early.",
      ],
      overallRisk: "Contested",
      riskScore: 55,
      confidence: "medium",
    },
    phase3: {
      badge: { label: "CONTESTED", color: "amber", emoji: "●" },
      predictionText: "This matchup should be decided by execution under pressure. The bowler has early control, but the batter can recover the matchup if set for the final overs.",
      attackWindow: "Overs 16-20",
      statCards: [
        { label: "BATTER STRIKE RATE", value: isKohli ? "138.2" : "142.5", subtext: "Career", highlight: true },
        { label: "BOWLER ECONOMY", value: isBumrah ? "6.42" : "7.85", subtext: "Career", highlight: false },
        { label: "HEAD-TO-HEAD", value: `${isKohli && isBumrah ? 4 : 2} dismissals`, subtext: "Historical", highlight: false },
        { label: "RISK SCORE", value: "55", subtext: "Out of 100", highlight: false },
      ],
      batterCard: { name: batterName, imageUrl: null, role: "Batter", formBadge: "🔥 In Form", topStat: `SR: ${isKohli ? 138.2 : 142.5}` },
      bowlerCard: { name: bowlerName, imageUrl: null, role: "Bowler", formBadge: "⚡ Inconsistent", topStat: `Eco: ${isBumrah ? 6.42 : 7.85}` },
      timeline: ["Data Fetched", "Stats Analyzed", "Venue Factored", "Verdict Generated"],
      shareText: `${batterName} vs ${bowlerName} - CONTESTED | FormGuide`,
      generatedAt: new Date().toISOString(),
    },
    fetchedAt: new Date().toISOString(),
  };
}
