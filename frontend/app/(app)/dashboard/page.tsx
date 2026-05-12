"use client";
import { useTaxProfile } from "@/hooks/useTaxProfile";
import { StatCard } from "@/components/dashboard/StatCard";
import { TaxDonutChart } from "@/components/dashboard/TaxDonutChart";
import { RefundCard } from "@/components/dashboard/RefundCard";
import { DeductionBar } from "@/components/dashboard/DeductionBar";
import { motion } from "framer-motion";
import { DollarSign, BadgePercent, Wallet, TrendingUp, MessageCircle } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { profile, calculation, loading, hasIncome } = useTaxProfile();

  if (loading) {
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

  if (!hasIncome || !calculation) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-10 max-w-sm">
          <MessageCircle className="w-10 h-10 text-[var(--taxzy-stone)] mx-auto mb-4" />
          <h2 className="text-lg font-bold text-[var(--foreground)] mb-2">No tax data yet</h2>
          <p className="text-sm text-[var(--taxzy-stone)] mb-6">
            Chat with KarSmart to fill in your income, TDS, and deductions — your dashboard will populate automatically.
          </p>
          <Link
            href="/chat"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--taxzy-slate)] text-white text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <MessageCircle className="w-4 h-4" />
            Start chat
          </Link>
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
