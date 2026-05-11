"use client";
import { useEffect, useState } from "react";
import { getTaxUsage, calculate } from "@/lib/api";
import { IndiaMap } from "@/components/tax-usage/IndiaMap";
import { UsageBreakdown } from "@/components/tax-usage/UsageBreakdown";
import { motion } from "framer-motion";
import type { TaxUsage } from "@/types/api";
import { Map } from "lucide-react";
import { formatINR } from "@/lib/tax-calculator";

export default function TaxUsagePage() {
  const [usage, setUsage] = useState<TaxUsage | null>(null);
  const [taxPaid, setTaxPaid] = useState(0);

  useEffect(() => {
    calculate()
      .then((calc) => {
        setTaxPaid(calc.tax_liability);
        return getTaxUsage(calc.tax_liability);
      })
      .then(setUsage)
      .catch(() => {});
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
        <div className="flex items-center gap-2 mb-1">
          <Map size={20} className="text-[var(--taxzy-slate)]" />
          <h1 className="text-xl font-bold text-[var(--foreground)]">Tax usage</h1>
        </div>
        <p className="text-sm text-[var(--taxzy-stone)] mb-6">
          See where your {formatINR(taxPaid)} in taxes goes to work for India
        </p>
      </motion.div>

      {usage ? (
        <div className="grid md:grid-cols-2 gap-4">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, delay: 0.1 }}>
            <IndiaMap breakdown={usage.breakdown} />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, delay: 0.15 }}>
            <UsageBreakdown breakdown={usage.breakdown} taxPaid={taxPaid} />
          </motion.div>
          {usage.summary && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.4 }}
              className="md:col-span-2 bg-[var(--muted)] rounded-xl px-5 py-4 text-sm text-[var(--foreground)]"
            >
              {usage.summary}
            </motion.div>
          )}
        </div>
      ) : (
        <div className="animate-pulse grid md:grid-cols-2 gap-4">
          <div className="h-80 rounded-xl bg-[var(--muted)]" />
          <div className="h-80 rounded-xl bg-[var(--muted)]" />
        </div>
      )}
    </div>
  );
}
