"use client";
import { motion } from "framer-motion";
import { formatINR } from "@/lib/tax-calculator";
import type { TaxUsageItem } from "@/types/api";

interface Props {
  breakdown: TaxUsageItem[];
  taxPaid: number;
}

const COLORS = [
  "#3D5A80", "#1F3654", "#A86545", "#C4784F",
  "#5B80A8", "#7A9CBF", "#8B6E5A", "#6B7280",
];

export function UsageBreakdown({ breakdown, taxPaid }: Props) {
  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
      <p className="text-xs font-semibold uppercase tracking-widest text-[var(--taxzy-stone)] mb-1">Where your tax goes</p>
      <p className="text-sm text-[var(--taxzy-stone)] mb-5">
        Based on {formatINR(taxPaid)} paid
      </p>

      <div className="space-y-4">
        {breakdown.map((item, i) => (
          <motion.div
            key={item.category}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08, duration: 0.25 }}
          >
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-sm font-medium text-[var(--foreground)]">{item.category}</span>
              <div className="text-right">
                <span className="money text-xs font-semibold text-[var(--foreground)]">{formatINR(Math.round(item.amount))}</span>
                <span className="text-xs text-[var(--taxzy-stone)] ml-1">({item.percentage}%)</span>
              </div>
            </div>
            <div className="relative h-2 bg-[var(--muted)] rounded-full overflow-hidden">
              <motion.div
                className="absolute left-0 top-0 h-full rounded-full"
                style={{ background: COLORS[i % COLORS.length] }}
                initial={{ width: 0 }}
                animate={{ width: `${item.percentage}%` }}
                transition={{ delay: i * 0.08 + 0.1, duration: 0.6, ease: "easeOut" }}
              />
            </div>
            <p className="text-xs text-[var(--taxzy-stone)] mt-1">{item.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
