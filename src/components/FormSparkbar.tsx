/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

interface FormSparkbarProps {
  values: number[];
}

export function FormSparkbar({ values }: FormSparkbarProps) {
  const max = Math.max(...values, 1); // prevent div by zero
  
  return (
    <div className="flex gap-[2px] items-end h-6">
      {values.map((v, i) => {
        const h = Math.round((v / max) * 24);
        const color = v >= max * 0.7 
          ? "bg-emerald-400" 
          : v >= max * 0.4 
            ? "bg-emerald-400/50" 
            : "bg-rose-400/60";
            
        return (
          <div 
            key={i} 
            className={`w-1 rounded-t-[1px] transition-all duration-500 hover:opacity-80 ${color}`} 
            style={{ height: `${Math.max(h, 2)}px` }} 
            title={`Value: ${v}`}
          />
        );
      })}
    </div>
  );
}
