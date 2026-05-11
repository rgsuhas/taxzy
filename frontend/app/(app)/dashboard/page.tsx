"use client";
import { useEffect } from "react";
import { useTaxProfile } from "@/hooks/useTaxProfile";
import { StatCard } from "@/components/dashboard/StatCard";
import { TaxDonutChart } from "@/components/dashboard/TaxDonutChart";
import { RefundCard } from "@/components/dashboard/RefundCard";
import { DeductionBar } from "@/components/dashboard/DeductionBar";
import { motion } from "framer-motion";
import { DollarSign, BadgePercent, Wallet, TrendingUp } from "lucide-react";

export default function DashboardPage() {
  const { profile, calculation, refresh } = useTaxProfile();

  useEffect(() => { refresh(); }, []);

  if (!calculation || !profile) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 rounded-xl bg-[var(--muted)]" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
        <h1 className="text-xl font-bold text-[var(--foreground)] mb-1">Tax dashboard</h1>
        <p className="text-sm text-[var(--taxzy-stone)] mb-6">AY {profile.ay || "2024-25"} — {profile.regime === "old" ? "Old regime" : "New regime"}</p>
      </motion.div>

      {/* Refund hero */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, delay: 0.05 }} className="mb-6">
        <RefundCard amount={calculation.refund_or_payable} />
      </motion.div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Gross income", value: calculation.gross_income, icon: DollarSign, variant: "default" as const },
          { label: "TDS deducted", value: calculation.tds_paid, icon: BadgePercent, variant: "success" as const },
          { label: "Deductions", value: Object.values(calculation.deductions_breakdown).reduce((a, b) => a + b, 0), icon: Wallet, variant: "accent" as const },
          { label: "Tax liability", value: calculation.tax_liability, icon: TrendingUp, variant: "clay" as const },
        ].map((card, i) => (
          <motion.div key={card.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, delay: 0.1 + i * 0.05 }}>
            <StatCard {...card} />
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, delay: 0.3 }}>
          <TaxDonutChart calculation={calculation} />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, delay: 0.35 }}>
          <DeductionBar breakdown={calculation.deductions_breakdown} />
        </motion.div>
      </div>
    </div>
  );
}
