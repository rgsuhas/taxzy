"use client";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import { formatINR } from "@/lib/tax-calculator";
import type { MarketplaceOffer } from "@/types/api";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface Props {
  offer: MarketplaceOffer;
  refundAmount: number;
  onRedeem: (offer: MarketplaceOffer) => void;
  isPrimary?: boolean;
}

export function OfferCard({ offer, refundAmount, onRedeem, isPrimary }: Props) {
  const voucher = Math.round(refundAmount * offer.conversion_rate);
  const bonus = voucher - refundAmount;
  const extraPct = Math.round((offer.conversion_rate - 1) * 100);

  return (
    <motion.div
      whileHover={{ translateY: -2 }}
      transition={{ duration: 0.15 }}
      className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-[var(--muted)] flex items-center justify-center overflow-hidden">
            <Image
              src={offer.logo_url}
              alt={offer.brand}
              width={32}
              height={32}
              className="object-contain"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
          </div>
          <div>
            <p className="font-semibold text-[var(--foreground)]">{offer.brand}</p>
            <div className="flex items-center gap-1 text-xs text-[var(--taxzy-success)]">
              <Zap size={11} />
              <span>{offer.delivery} delivery</span>
            </div>
          </div>
          <div className="ml-auto text-right">
            <span className="text-xs font-semibold text-[var(--taxzy-success)] bg-[var(--taxzy-success)]/10 px-2 py-0.5 rounded-full">
              +{extraPct}%
            </span>
          </div>
        </div>

        <div className="space-y-1.5 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-[var(--taxzy-stone)]">Your refund</span>
            <span className="money font-medium">{formatINR(refundAmount)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[var(--taxzy-stone)]">You get</span>
            <span className="money font-semibold text-[var(--taxzy-success)]">{formatINR(voucher)}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-[var(--taxzy-stone)]">Bonus</span>
            <span className="money text-[var(--taxzy-success)]">+{formatINR(bonus)}</span>
          </div>
        </div>

        <p className="text-xs text-[var(--taxzy-stone)] mb-4">{offer.description}</p>

        <button
          onClick={() => onRedeem(offer)}
          className={cn(
            "w-full py-2.5 rounded-lg text-sm font-semibold transition-colors",
            isPrimary
              ? "bg-[var(--taxzy-slate)] text-white hover:bg-[var(--taxzy-slate-dark)]"
              : "bg-[var(--taxzy-clay)] text-white hover:opacity-90"
          )}
        >
          Redeem {formatINR(voucher)}
        </button>
      </div>
    </motion.div>
  );
}
