/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

interface ProgressBarProps {
  percent: number;
}

export function ProgressBar({ percent }: ProgressBarProps) {
  return (
    <div className="w-full">
      <div className="flex justify-between items-center text-xs text-slate-400 font-mono mb-2">
        <span>Fetch Progress</span>
        <span className="text-[#75ff9e] font-semibold">{percent}%</span>
      </div>
      <div className="w-full h-2.5 bg-[#0a0f1e] rounded-full overflow-hidden border border-[#1e293b] p-[1px]">
        <div
          className="h-full bg-gradient-to-r from-[#00e676] to-[#75ff9e] rounded-full transition-all duration-700 ease-out shadow-[0_0_8px_rgba(117,255,158,0.5)]"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
