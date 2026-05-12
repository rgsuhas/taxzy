"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { useTaxStore } from "@/store/taxStore";
import { cn } from "@/lib/utils";
import { Sun, Moon, BookOpen, Search } from "lucide-react";

const modes = [
  { key: "light",   label: "Light",   icon: Sun },
  { key: "dark",    label: "Dark",    icon: Moon },
  { key: "reading", label: "Reading", icon: BookOpen },
] as const;

const PAGE_TITLES: Record<string, string> = {
  "/chat":       "Chat",
  "/dashboard":  "Dashboard",
  "/documents":  "Documents",
  "/marketplace":"Marketplace",
  "/tracker":    "Tracker",
  "/tax-usage":  "Tax Usage",
};

export function TopBar() {
  const { theme, setTheme } = useTaxStore();
  const pathname = usePathname();
  const [search, setSearch] = useState("");

  const title = PAGE_TITLES[pathname] ?? "KarSmart";

  return (
    <div className="flex items-center gap-4 px-5 py-3 border-b border-[var(--border)] bg-[var(--card)] shrink-0">
      {/* Page title */}
      <h2 className="text-base font-semibold text-[var(--foreground)] shrink-0 w-32">
        {title}
      </h2>

      {/* Search bar */}
      <div className="flex-1 flex items-center gap-2 bg-[var(--muted)] rounded-lg px-3 py-1.5">
        <Search size={14} className="text-[var(--taxzy-stone)] shrink-0" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search..."
          className="flex-1 bg-transparent text-sm text-[var(--foreground)] placeholder:text-[var(--taxzy-stone)] outline-none"
        />
      </div>

      {/* Mode switcher */}
      <div className="flex items-center gap-1 bg-[var(--muted)] rounded-full px-1 py-1 shrink-0">
        {modes.map((m) => {
          const Icon = m.icon;
          return (
            <button
              key={m.key}
              onClick={() => setTheme(m.key)}
              title={m.label}
              className={cn(
                "p-1.5 rounded-full transition-all duration-200",
                theme === m.key
                  ? "bg-[var(--taxzy-slate)] text-white shadow-sm"
                  : "text-[var(--taxzy-stone)] hover:text-[var(--taxzy-ink)]"
              )}
            >
              <Icon size={15} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
