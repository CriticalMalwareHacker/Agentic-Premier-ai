import { useEffect, useMemo, useState } from "react";

interface SearchComboboxProps {
  id: string;
  label: string;
  value: string;
  options: string[];
  placeholder?: string;
  onChange: (value: string) => void;
}

function scoreOption(option: string, query: string) {
  const source = option.toLowerCase();
  const target = query.toLowerCase().trim();

  if (!target) return 1;
  if (source === target) return 100;
  if (source.startsWith(target)) return 80;
  if (source.includes(target)) return 60;

  let score = 0;
  let cursor = 0;
  for (const char of target) {
    const index = source.indexOf(char, cursor);
    if (index === -1) return 0;
    score += Math.max(1, 10 - (index - cursor));
    cursor = index + 1;
  }

  return score;
}

export function SearchCombobox({ id, label, value, options, placeholder, onChange }: SearchComboboxProps) {
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  const filteredOptions = useMemo(() => {
    return options
      .map((option) => ({ option, score: scoreOption(option, query) }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score || a.option.localeCompare(b.option))
      .slice(0, 10)
      .map((item) => item.option);
  }, [options, query]);

  const commitValue = (nextValue: string) => {
    const cleanValue = nextValue.trim();
    if (!cleanValue) {
      setQuery(value);
      setOpen(false);
      return;
    }

    setQuery(cleanValue);
    onChange(cleanValue);
    setOpen(false);
  };

  return (
    <div className="relative flex flex-col space-y-1.5">
      <label htmlFor={id} className="text-[10px] text-white/40 uppercase tracking-widest font-mono">
        {label}
      </label>
      <input
        id={id}
        aria-expanded={open}
        value={query}
        placeholder={placeholder}
        autoComplete="off"
        onFocus={() => {
          setQuery(value);
          setOpen(true);
        }}
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
        }}
        onBlur={() => commitValue(query)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            commitValue(filteredOptions[0] || query);
          }
          if (event.key === "Escape") {
            setQuery(value);
            setOpen(false);
          }
        }}
        className="h-10 bg-[#0A0A0B] border border-white/10 rounded px-3 text-xs font-mono text-white placeholder:text-white/20 focus:outline-none focus:border-emerald-400 transition-colors"
      />

      {open && (
        <div className="absolute left-0 right-0 top-[62px] z-30 max-h-64 overflow-y-auto rounded border border-white/10 bg-[#09090A] shadow-2xl">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <button
                key={option}
                type="button"
                onMouseDown={(event) => {
                  event.preventDefault();
                  commitValue(option);
                }}
                className={`block w-full px-3 py-2 text-left text-xs font-mono transition-colors ${
                  option === value
                    ? "bg-emerald-400/10 text-emerald-300"
                    : "text-slate-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                {option}
              </button>
            ))
          ) : (
            <div className="px-3 py-3 text-xs font-mono text-white/40">
              Press Enter to use "{query.trim() || "custom value"}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}
