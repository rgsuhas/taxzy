"use client";
import { motion } from "framer-motion";
import { formatINR } from "@/lib/tax-calculator";
import type { TaxUsageItem } from "@/types/api";

interface Props {
  breakdown: TaxUsageItem[];
}

const COLORS = ["#3D5A80", "#1F3654", "#A86545", "#C4784F", "#5B80A8", "#7A9CBF", "#8B6E5A", "#6B7280"];

export function IndiaMap({ breakdown }: Props) {
  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
      <p className="text-xs font-semibold uppercase tracking-widest text-[var(--taxzy-stone)] mb-4">Budget allocation</p>

      {/* Simple visual representation using proportional blocks */}
      <div className="relative w-full h-64 rounded-lg overflow-hidden flex flex-wrap gap-1">
        {breakdown.map((item, i) => (
          <motion.div
            key={item.category}
            title={`${item.category}: ${item.percentage}%`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1, duration: 0.3 }}
            className="flex items-center justify-center rounded cursor-default group relative"
            style={{
              background: COLORS[i % COLORS.length],
              flexBasis: `${item.percentage * 3.5}%`,
              flexGrow: item.percentage,
              minWidth: "40px",
            }}
          >
            <div className="text-white text-center px-1">
              <p className="text-[10px] font-semibold leading-tight hidden group-hover:block">{item.category}</p>
              <p className="text-xs font-bold">{item.percentage}%</p>
            </div>
            {/* Hover tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-[var(--foreground)] text-[var(--background)] text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
              {item.category}: {formatINR(Math.round(item.amount))}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 mt-4">
        {breakdown.map((item, i) => (
          <div key={item.category} className="flex items-center gap-1.5 text-xs text-[var(--taxzy-stone)]">
            <span className="w-2 h-2 rounded-sm shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
            {item.category}
          </div>
        ))}
      </div>
    </div>
  );
}
