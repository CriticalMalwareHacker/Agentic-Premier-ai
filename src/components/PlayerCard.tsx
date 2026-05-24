/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PlayerAvatar } from "./PlayerAvatar";
import { RoleBadge } from "./RoleBadge";

const formBadgeStyle: Record<string, string> = {
  "🔥 In Form": "text-emerald-400 border-emerald-400/40 bg-emerald-400/10 shadow-[0_0_8px_rgba(52,211,153,0.1)]",
  "📉 Poor Form": "text-rose-400 border-rose-400/40 bg-rose-400/10 shadow-[0_0_8px_rgba(244,63,94,0.1)]",
  "⚡ Inconsistent": "text-amber-400 border-amber-400/40 bg-amber-400/10 shadow-[0_0_8px_rgba(245,158,11,0.1)]",
};

interface PlayerCardProps {
  card: {
    name: string;
    imageUrl: string | null;
    role: string;
    formBadge: "🔥 In Form" | "📉 Poor Form" | "⚡ Inconsistent";
    topStat: string;
  };
}

export function PlayerCard({ card }: PlayerCardProps) {
  return (
    <div className="bg-[#0E0E10] border border-white/10 rounded-xl p-4 md:p-5 flex items-center gap-4 hover:border-white/20 transition-colors shadow-lg">
      <PlayerAvatar imageUrl={card.imageUrl ?? undefined} name={card.name} size="lg" />
      <div className="flex flex-col gap-1.5 flex-grow">
        <span className="text-sm md:text-base font-semibold text-white tracking-wide truncate">
          {card.name}
        </span>
        <div className="flex items-center gap-2">
          <RoleBadge role={card.role} />
          <span
            className={`px-2 py-0.5 border font-mono text-[9px] uppercase tracking-wider rounded-sm ${
              formBadgeStyle[card.formBadge] ?? formBadgeStyle["⚡ Inconsistent"]
            }`}
          >
            {card.formBadge}
          </span>
        </div>
      </div>
      <span className="text-xl md:text-2xl font-mono text-emerald-400 font-bold tracking-tight drop-shadow-[0_0_5px_rgba(52,211,153,0.2)] whitespace-nowrap">
        {card.topStat}
      </span>
    </div>
  );
}
