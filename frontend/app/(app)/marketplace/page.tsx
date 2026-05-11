"use client";
import { useEffect, useState } from "react";
import { getOffers, redeemOffer, calculate } from "@/lib/api";
import { OfferCard } from "@/components/marketplace/OfferCard";
import { ConfettiRedemption } from "@/components/marketplace/ConfettiRedemption";
import { motion } from "framer-motion";
import type { MarketplaceOffer, RedeemResponse, TaxCalculation } from "@/types/api";
import { formatINR } from "@/lib/tax-calculator";
import { ShoppingBag } from "lucide-react";

export default function MarketplacePage() {
  const [offers, setOffers] = useState<MarketplaceOffer[]>([]);
  const [calculation, setCalculation] = useState<TaxCalculation | null>(null);
  const [redemption, setRedemption] = useState<RedeemResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getOffers().then(setOffers).catch(() => {});
    calculate().then(setCalculation).catch(() => {});
  }, []);

  const refundAmount = calculation?.refund_or_payable ?? 0;

  const onRedeem = async (offer: MarketplaceOffer) => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await redeemOffer(offer.offer_id);
      setRedemption(res);
    } catch {
      alert("Redemption failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
        <div className="flex items-center gap-2 mb-1">
          <ShoppingBag size={20} className="text-[var(--taxzy-slate)]" />
          <h1 className="text-xl font-bold text-[var(--foreground)]">Refund marketplace</h1>
        </div>
        <p className="text-sm text-[var(--taxzy-stone)] mb-2">
          Convert your{" "}
          <span className="money font-semibold text-[var(--taxzy-success)]">{formatINR(refundAmount)}</span>{" "}
          refund into more value
        </p>
      </motion.div>

      {refundAmount <= 0 && calculation && (
        <div className="bg-[var(--muted)] rounded-xl p-4 text-sm text-[var(--taxzy-stone)] mb-6">
          No refund to redeem this year. Come back once you have a refund due.
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {offers.map((offer, i) => (
          <motion.div
            key={offer.offer_id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: i * 0.07 }}
          >
            <OfferCard
              offer={offer}
              refundAmount={Math.max(0, refundAmount)}
              onRedeem={onRedeem}
              isPrimary={i === 0}
            />
          </motion.div>
        ))}
      </div>

      {redemption && (
        <ConfettiRedemption result={redemption} onClose={() => setRedemption(null)} />
      )}
    </div>
  );
}
