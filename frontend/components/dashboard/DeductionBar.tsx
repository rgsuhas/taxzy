"use client";
import { formatINR } from "@/lib/tax-calculator";
import { Progress } from "@/components/ui/progress";
import type { DeductionsBreakdown } from "@/types/api";

interface Props {
  breakdown: DeductionsBreakdown;
}

const LIMITS: Record<string, number> = {
  "80c": 150000,
  "80d": 50000,
  hra: 200000,
  standard: 50000,
};

const LABELS: Record<string, string> = {
  "80c": "Section 80C",
  "80d": "Section 80D",
  hra: "HRA exemption",
  standard: "Standard deduction",
};

export function DeductionBar({ breakdown }: Props) {
  const entries = Object.entries(breakdown) as [keyof DeductionsBreakdown, number][];

  return (
    <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-5">
      <p className="text-xs font-semibold uppercase tracking-widest text-[var(--taxzy-stone)] mb-4">Deductions claimed</p>
      <div className="flex flex-col gap-4">
        {entries.map(([key, value]) => {
          const limit = LIMITS[key] ?? 150000;
          const pct = Math.min(100, Math.round((value / limit) * 100));
          return (
            <div key={key}>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-sm font-medium text-[var(--foreground)]">{LABELS[key]}</span>
                <span className="money text-xs text-[var(--taxzy-stone)]">
                  {formatINR(value)} / {formatINR(limit)}
                </span>
              </div>
              <div className="relative">
                <Progress value={pct} className="h-2" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
