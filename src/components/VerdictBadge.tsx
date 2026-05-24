/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const badgeStyles: Record<string, string> = {
  "High Risk": "border-rose-500/50 text-rose-400 bg-rose-500/10 shadow-[0_0_10px_rgba(244,63,94,0.15)]",
  "Contested": "border-amber-500/50 text-amber-400 bg-amber-500/10 shadow-[0_0_10px_rgba(245,158,11,0.15)]",
  "Batter Favored": "border-emerald-500/50 text-emerald-400 bg-emerald-500/10 shadow-[0_0_10px_rgba(16,185,129,0.15)]",
};

export function VerdictBadge({ verdict }: { verdict: string }) {
  return (
    <span className={`px-2.5 py-1 text-[10px] sm:text-xs font-mono border rounded-full uppercase tracking-widest font-semibold transition-all ${badgeStyles[verdict] ?? badgeStyles["Contested"]}`}>
      {verdict.toUpperCase()}
    </span>
  );
}
