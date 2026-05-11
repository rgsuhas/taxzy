"use client";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { formatINR } from "@/lib/tax-calculator";
import type { TaxCalculation } from "@/types/api";

interface Props {
  calculation: TaxCalculation;
}

export function TaxDonutChart({ calculation }: Props) {
  const { gross_income, tax_liability, refund_or_payable, deductions_breakdown } = calculation;
  const totalDeductions = Object.values(deductions_breakdown).reduce((a, b) => a + b, 0);

  const data = [
    { name: "Tax paid", value: tax_liability, color: "#3D5A80" },
    { name: "Deductions", value: totalDeductions, color: "#A86545" },
    { name: "Take-home", value: gross_income - tax_liability - totalDeductions, color: "#E8E6E1" },
  ].filter((d) => d.value > 0);

  return (
    <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-5">
      <p className="text-xs font-semibold uppercase tracking-widest text-[var(--taxzy-stone)] mb-4">Income breakdown</p>
      <div className="relative h-52">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={2}
              dataKey="value"
              animationBegin={0}
              animationDuration={800}
            >
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.color} stroke="none" />
              ))}
            </Pie>
            <Tooltip
              formatter={(v) => formatINR(Number(v))}
              contentStyle={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                fontSize: "12px",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-xs text-[var(--taxzy-stone)]">Refund</span>
          <span className="money text-lg font-semibold text-[var(--taxzy-success)]">
            {formatINR(refund_or_payable)}
          </span>
        </div>
      </div>
      <div className="flex flex-wrap gap-3 mt-3">
        {data.map((d) => (
          <div key={d.name} className="flex items-center gap-1.5 text-xs text-[var(--taxzy-stone)]">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: d.color }} />
            {d.name}
          </div>
        ))}
      </div>
    </div>
  );
}
