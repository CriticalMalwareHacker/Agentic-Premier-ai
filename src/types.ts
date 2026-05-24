/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type StepStatus = "pending" | "active" | "done";

export interface BatterStats {
  matches: number;
  innings: number;
  runs: number;
  average: number;
  strikeRate: number;
  highestScore: string;
  fifties: number;
  hundreds: number;
}

export interface BatterRecentForm {
  match: string;
  runs: number;
  balls: number;
  sr: number;
}

export interface BatterInfo {
  name: string;
  id: string;
  imageUrl: string | null;
  country: string;
  role: string;
  t20Stats: BatterStats;
  recentForm: BatterRecentForm[];
}

export interface BowlerStats {
  matches: number;
  wickets: number;
  economy: number;
  average: number;
  bestFigures: string;
}

export interface BowlerRecentForm {
  match: string;
  overs: number;
  runs: number;
  wickets: number;
  economy: number;
}

export interface BowlerInfo {
  name: string;
  id: string;
  imageUrl: string | null;
  country: string;
  role: string;
  t20Stats: BowlerStats;
  recentForm: BowlerRecentForm[];
}

export interface H2HInfo {
  dismissals: number;
  totalEncounters: number;
  batterStrikeRateVsBowler: number;
  lastEncounterResult: string;
}

export interface VenueInfo {
  name: string;
  city: string;
  avgT20Score: number;
  spinAdvantage: boolean;
  dewFactor: boolean;
  pitchDescription: string;
}

export interface TacticalSimulationInfo {
  winnerMatchupChance: number;
  strategicKeyBatter: string;
  strategicKeyBowler: string;
  powerplayTactics: string;
  deathOversTactics: string;
  overallVerdict: string;
}

export interface Phase2Output {
  batterFormScore: number;
  batterFormTrend: "rising" | "falling" | "consistent";
  bowlerThreatScore: number;
  bowlerThreatTrend: "improving" | "expensive" | "consistent";
  headToHead: {
    dominance: "bowler_dominant" | "batter_dominant" | "contested";
    dominanceStrength: number;
    summary: string;
  };
  venue: {
    venueAdjustment: number;
    venueNote: string;
  };
  phaseAnalysis: {
    powerplayRisk: "high" | "medium" | "low";
    middleOversRisk: "high" | "medium" | "low";
    deathOversRisk: "high" | "medium" | "low";
    bestAttackWindow: string;
  };
  highlights: [string, string, string];
  overallRisk: "High Risk" | "Contested" | "Batter Favored";
  riskScore: number;
  confidence: "high" | "medium" | "low";
}

export interface Phase3Output {
  badge: { label: string; color: "red" | "amber" | "green"; emoji: string };
  predictionText: string;
  attackWindow: string;
  statCards: {
    label: string;
    value: string;
    subtext: string;
    highlight: boolean;
  }[];
  batterCard: {
    name: string;
    imageUrl: string | null;
    role: string;
    formBadge: "🔥 In Form" | "📉 Poor Form" | "⚡ Inconsistent";
    topStat: string;
  };
  bowlerCard: {
    name: string;
    imageUrl: string | null;
    role: string;
    formBadge: "🔥 In Form" | "📉 Poor Form" | "⚡ Inconsistent";
    topStat: string;
  };
  timeline: [string, string, string, string];
  shareText: string;
  generatedAt: string;
}

export interface MatchupAnalysis {
  isMock: boolean;
  batter: BatterInfo;
  bowler: BowlerInfo;
  headToHead: H2HInfo;
  venue: VenueInfo;
  tacticalSimulation?: TacticalSimulationInfo; // Legacy
  phase2?: Phase2Output;
  phase3?: Phase3Output;
  fetchedAt: string;
}

export interface PipelineStepState {
  label: string;
  status: StepStatus;
  message: string;
}
