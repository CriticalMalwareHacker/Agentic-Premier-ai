/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { VerdictBadge } from "./VerdictBadge";
import { StatBox } from "./StatsGrid";
import { Phase3Output } from "../types";

export function ResultsCard({ data }: { data: Phase3Output }) {
  return (
    <div className="lg:col-span-8 bg-[#0E0E10] border border-white/10 rounded-xl p-4 md:p-6 flex flex-col gap-4 relative overflow-hidden shadow-xl">
      {/* Neon glow blob */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-400/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex justify-between items-start">
        <h2 className="text-sm md:text-base font-semibold text-white uppercase tracking-wider font-mono">
          Model Output Verdict
        </h2>
        <VerdictBadge verdict={data.badge.label} />
      </div>

      {/* Stat boxes — 2 col grid */}
      <div className="grid grid-cols-2 gap-4">
        <StatBox
          value={data.statCards[0].value}
          label={data.statCards[0].label}
          highlight={data.statCards[0].highlight}
        />
        <StatBox
          value={data.statCards[1].value}
          label={data.statCards[1].label}
          highlight={data.statCards[1].highlight}
        />
      </div>

      <hr className="border-white/5" />

      {/* Head-to-head + risk badge */}
      <div className="flex flex-col items-center gap-2 py-2">
        <span className="text-sm text-slate-300 font-medium font-sans">
          {data.statCards[2].value}
        </span>
      </div>

      {/* Prediction text — italic quote block */}
      <div className="bg-white/5 border border-white/10 rounded-lg p-4">
        <p className="text-sm text-slate-300 italic font-sans leading-relaxed">
          "{data.predictionText}"
        </p>
      </div>

      {/* Attack window badge */}
      <div className="mt-auto pt-2 flex justify-center">
        <span className="text-xs font-mono text-emerald-400 bg-emerald-400/10 px-4 py-1.5 rounded border border-emerald-400/30 tracking-widest uppercase shadow-[0_0_8px_rgba(52,211,153,0.15)]">
          Best Attack Window: {data.attackWindow}
        </span>
      </div>
    </div>
  );
}
