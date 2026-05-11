"use client";
import { useTaxStore } from "@/store/taxStore";
import { cn } from "@/lib/utils";
import { Sun, Moon, BookOpen } from "lucide-react";

const modes = [
  { key: "light", label: "Light", icon: Sun },
  { key: "dark", label: "Dark", icon: Moon },
  { key: "reading", label: "Reading", icon: BookOpen },
] as const;

export function ModeSwitcher() {
  const { theme, setTheme } = useTaxStore();

  return (
    <div className="glass rounded-full px-1 py-1 flex gap-1 fixed top-4 right-4 z-50">
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
            <Icon size={14} />
          </button>
        );
      })}
    </div>
  );
}
