"use client";
import { useCountUp } from "@/hooks/useCountUp";
import { formatINR } from "@/lib/tax-calculator";
import { TrendingUp, TrendingDown } from "lucide-react";

interface Props {
  amount: number;
}

export function RefundCard({ amount }: Props) {
  const animated = useCountUp(Math.abs(amount));
  const isRefund = amount >= 0;

  return (
    <div
      className="rounded-xl p-6 text-white relative overflow-hidden"
      style={{
        background: isRefund
          ? "linear-gradient(135deg, #3D5A80 0%, #1F3654 100%)"
          : "linear-gradient(135deg, #A86545 0%, #7A4A30 100%)",
      }}
    >
      {/* Radial halo */}
      <div
        className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-10"
        style={{ background: "radial-gradient(circle, #fff 0%, transparent 70%)" }}
      />

      <p className="text-xs font-semibold uppercase tracking-widest opacity-70 mb-2">
        {isRefund ? "Refund expected" : "Tax payable"}
      </p>

      <div className="flex items-end gap-3 mb-3">
        <p className="money text-4xl font-semibold">{formatINR(animated)}</p>
        {isRefund
          ? <TrendingUp size={20} className="opacity-70 mb-1" />
          : <TrendingDown size={20} className="opacity-70 mb-1" />
        }
      </div>

      <p className="text-xs opacity-60">
        {isRefund
          ? "Will be credited to your bank account after ITR processing"
          : "Due before the filing deadline"}
      </p>
    </div>
  );
}
