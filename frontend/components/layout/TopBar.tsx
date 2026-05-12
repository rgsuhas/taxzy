"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useTaxStore } from "@/store/taxStore";
import { cn } from "@/lib/utils";
import { Sun, Moon, Search, X } from "lucide-react";

const PAGE_TITLES: Record<string, string> = {
  "/chat":        "Chat",
  "/dashboard":   "Dashboard",
  "/documents":   "Documents",
  "/marketplace": "Marketplace",
  "/tracker":     "Tracker",
  "/tax-usage":   "Tax Usage",
};

export function TopBar() {
  const { theme, setTheme, searchQuery, setSearchQuery } = useTaxStore();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname !== "/documents") setSearchQuery("");
  }, [pathname, setSearchQuery]);

  const isDocuments = pathname === "/documents";
  const title = PAGE_TITLES[pathname] ?? "KarSmart";

  return (
    <div className="flex items-center gap-4 px-5 py-3 border-b border-[var(--border)] bg-[var(--card)] shrink-0">
      {/* Page title */}
      <h2 className="text-base font-semibold text-[var(--foreground)] shrink-0 w-32">
        {title}
      </h2>

      {/* Pill search bar — centered */}
      <div className="flex-1 flex justify-center">
        <div className={cn(
          "flex items-center gap-2 bg-[var(--muted)] rounded-full px-4 py-1.5 w-full max-w-sm border border-transparent transition-colors",
          isDocuments
            ? "focus-within:border-[var(--taxzy-slate)]/40"
            : "opacity-40 pointer-events-none"
        )}>
          <Search size={13} className="text-[var(--taxzy-stone)] shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isDocuments ? "Search files and folders…" : "Search…"}
            className="flex-1 bg-transparent text-sm text-[var(--foreground)] placeholder:text-[var(--taxzy-stone)] outline-none min-w-0"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="shrink-0">
              <X size={12} className="text-[var(--taxzy-stone)] hover:text-[var(--foreground)]" />
            </button>
          )}
        </div>
      </div>

      {/* Theme toggle */}
      <button
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        className={cn(
          "shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-300 focus:outline-none text-xs font-medium",
          theme === "dark"
            ? "bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 text-yellow-300 shadow-lg shadow-slate-900/40 border border-slate-500/50"
            : "bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-300 hover:to-orange-300 text-white shadow-lg shadow-amber-500/30 border border-amber-300/60"
        )}
      >
        {theme === "dark"
          ? <><Sun size={14} strokeWidth={2.5} /><span>Light</span></>
          : <><Moon size={14} strokeWidth={2.5} /><span>Dark</span></>
        }
      </button>
    </div>
  );
}
