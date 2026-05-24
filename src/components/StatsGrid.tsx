/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

interface StatBoxProps {
  value: string;
  label: string;
  highlight?: boolean;
}

export function StatBox({ value, label, highlight = false }: StatBoxProps) {
  return (
    <div className="bg-[#0e0e10] border border-white/10 rounded-xl p-4 md:p-6 flex flex-col items-center justify-center text-center gap-2 shadow-[inset_0_1px_1px_rgba(255,255,255,0.01)] transition-colors">
      <span className={`text-3xl md:text-4xl font-mono tracking-tight font-medium ${highlight ? "text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]" : "text-white"}`}>
        {value}
      </span>
      <span className="font-mono text-[10px] md:text-xs text-white/40 uppercase tracking-widest">
        {label}
      </span>
    </div>
  );
}
