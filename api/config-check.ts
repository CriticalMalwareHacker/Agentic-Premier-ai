import { getCricketDataKey, getFirstEnvValue } from "./_shared.js";

export default function handler(_req: any, res: any) {
  const geminiApiKeyPresent = !!getFirstEnvValue(["GEMINI_API_KEY"], ["MY_GEMINI_API_KEY"]);
  const cricapiKeyPresent = !!getCricketDataKey();
  const missingKeys = [
    !geminiApiKeyPresent ? "GEMINI_API_KEY" : null,
    !cricapiKeyPresent ? "CRICAPI_KEY" : null,
  ].filter(Boolean);

  res.status(200).json({
    geminiApiKeyPresent,
    cricapiKeyPresent,
    portraitLookupAvailable: true,
    warn: missingKeys.length
      ? `Missing ${missingKeys.join(" and ")}. FormGuide will use available public portrait lookup and local fallbacks.`
      : null,
  });
}
