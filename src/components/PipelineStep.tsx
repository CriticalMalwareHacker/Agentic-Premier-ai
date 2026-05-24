/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { StepStatus } from "../types";
import { CheckCircle, Loader2, Circle } from "lucide-react";

interface PipelineStepProps {
  key?: any;
  label: string;
  status: StepStatus;
  message?: string;
}

const stepConfig = {
  done: {
    icon: CheckCircle,
    iconClass: "text-primary shrink-0 w-5 h-5",
    textClass: "text-on-background font-medium",
    cardClass: "bg-[#141c2f] border border-[#1e293b]",
  },
  active: {
    icon: Loader2,
    iconClass: "text-primary animate-spin shrink-0 w-5 h-5",
    textClass: "text-primary font-semibold",
    cardClass: "bg-[#141c2f] border border-[#1e293b] neon-ring shadow-[0_0_15px_rgba(117,255,158,0.15)]",
  },
  pending: {
    icon: Circle,
    iconClass: "text-slate-600 shrink-0 w-5 h-5",
    textClass: "text-slate-500",
    cardClass: "bg-[#141c2f]/40 border border-[#1e293b]/50 opacity-60",
  },
};

export function PipelineStep({ label, status, message }: PipelineStepProps) {
  const c = stepConfig[status];
  const IconComponent = c.icon;

  return (
    <div className={`rounded-lg p-3.5 flex flex-col gap-1 transition-all duration-300 ${c.cardClass}`}>
      <div className="flex items-center gap-3">
        <IconComponent className={c.iconClass} size={18} />
        <span className={`font-mono text-sm tracking-wide ${c.textClass}`}>{label}</span>
      </div>
      {status === "active" && message && (
        <p className="text-xs text-[#75ff9e]/80 animate-pulse font-mono ml-8 mt-1">
          &gt; {message}
        </p>
      )}
      {status === "done" && message && (
        <p className="text-xs text-slate-400 font-mono ml-8 mt-1">
          ✓ {message}
        </p>
      )}
    </div>
  );
}
