"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Search } from "lucide-react";

export type SelectOption = { value: string; label: string };

/**
 * The site's design-system dropdown: themed, rounded, animated, and searchable.
 * A native <select> cannot be styled to match the brand (rounded card, ivory
 * fill, brand-green states) or given a search box, so anywhere we would reach for
 * one on a consumer surface, we use this instead. Search appears automatically
 * once a list is long enough to warrant it.
 */
export function SelectMenu({
  value,
  onChange,
  options,
  placeholder = "Select",
  searchThreshold = 8,
  className = "",
  ariaLabel,
}: {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  searchThreshold?: number;
  className?: string;
  ariaLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIdx, setActiveIdx] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const showSearch = options.length > searchThreshold;
  const selected = options.find((o) => o.value === value);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, query]);

  // Close on outside click and on Escape.
  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Opening resets the search and the highlighted row, and focuses the search
  // box. Done in the event that opens it rather than in an effect, so there is
  // no second render after the first.
  const toggle = () => {
    setOpen((was) => {
      if (!was) {
        setQuery("");
        setActiveIdx(0);
        if (showSearch) requestAnimationFrame(() => searchRef.current?.focus());
      }
      return !was;
    });
  };

  const commit = (v: string) => {
    onChange(v);
    setOpen(false);
  };

  const onListKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const opt = filtered[activeIdx];
      if (opt) commit(opt.value);
    }
  };

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={toggle}
        className="w-full h-14 px-5 rounded-2xl bg-brand-bg-alt text-base text-brand-dark flex items-center justify-between gap-2 outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40 hover:bg-brand-bg-alt/70 transition-colors"
      >
        <span className={selected ? "text-brand-dark truncate" : "text-brand-iridium/60 truncate"}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          className={`w-5 h-5 shrink-0 text-brand-iridium/60 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          role="listbox"
          onKeyDown={onListKey}
          className="absolute z-30 mt-2 w-full min-w-[16rem] rounded-2xl bg-white border border-brand-iridium/10 shadow-[0_24px_60px_-24px_rgba(0,48,36,0.35)] p-2 origin-top animate-[fade-in_0.14s_ease-out] overflow-hidden"
        >
          {showSearch && (
            <div className="flex items-center gap-2 px-3 h-11 mb-1 rounded-xl bg-brand-bg-alt">
              <Search className="w-4 h-4 text-brand-iridium/50 shrink-0" />
              <input
                ref={searchRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActiveIdx(0);
                }}
                placeholder="Search"
                className="bg-transparent outline-none text-sm w-full text-brand-dark placeholder:text-brand-iridium/50"
              />
            </div>
          )}

          <div className="max-h-64 overflow-y-auto pr-0.5">
            {filtered.length === 0 ? (
              <p className="px-3 py-3 text-sm text-brand-iridium/60">No matches</p>
            ) : (
              filtered.map((opt, i) => {
                const isSelected = opt.value === value;
                const isActive = i === activeIdx;
                return (
                  <button
                    key={opt.value || "__all__"}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onMouseEnter={() => setActiveIdx(i)}
                    onClick={() => commit(opt.value)}
                    className={`w-full flex items-center justify-between gap-2 text-left px-3 py-2.5 rounded-xl text-base transition-colors ${
                      isActive ? "bg-brand-bg-alt" : ""
                    } ${isSelected ? "text-brand-primary font-semibold" : "text-brand-dark"}`}
                  >
                    <span className="truncate">{opt.label}</span>
                    {isSelected && <Check className="w-4 h-4 shrink-0 text-brand-primary" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
