"use client";
import { useEffect, useState } from "react";
import { getOffers, redeemOffer, calculate } from "@/lib/api";
import { OfferCard } from "@/components/marketplace/OfferCard";
import { ConfettiRedemption } from "@/components/marketplace/ConfettiRedemption";
import { motion, AnimatePresence } from "framer-motion";
import type { MarketplaceOffer, RedeemResponse, TaxCalculation } from "@/types/api";
import { formatINR } from "@/lib/tax-calculator";
import { ShoppingBag, Sparkles, ArrowRight, Info, X } from "lucide-react";

function PreClaimBanner({
  refundAmount,
  onDismiss,
}: {
  refundAmount: number;
  onDismiss: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.22 }}
      className="rounded-2xl p-5 mb-6 relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, rgba(168,101,69,0.1) 0%, rgba(61,90,128,0.08) 100%)",
        border: "1px solid rgba(168,101,69,0.22)",
      }}
    >
      {/* Dismiss */}
      <button
        onClick={onDismiss}
        className="absolute top-3 right-3 p-1 rounded-full opacity-50 hover:opacity-100 transition-opacity"
        aria-label="Dismiss"
      >
        <X size={13} style={{ color: "#6B7280" }} />
      </button>

      <div className="flex items-start gap-4">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "rgba(168,101,69,0.14)" }}
        >
          <Sparkles size={18} style={{ color: "#A86545" }} />
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <p className="text-sm font-bold" style={{ color: "#1C1F23" }}>
              Pre-claim your estimated refund now
            </p>
            <span
              className="text-[9px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full"
              style={{ background: "rgba(168,101,69,0.14)", color: "#A86545" }}
            >
              Before ITR is filed
            </span>
          </div>

          <p className="text-xs leading-relaxed mb-3" style={{ color: "#6B7280" }}>
            Your AI-estimated refund of{" "}
            <span className="font-bold" style={{ color: "#A86545" }}>
              {formatINR(refundAmount)}
            </span>{" "}
            can be locked in to marketplace offers right now — before your ITR is officially filed.
            Offers are reserved and fulfilled once the IT Dept. processes your return.
          </p>

          <div
            className="flex items-start gap-2 rounded-xl p-3 mb-4"
            style={{ background: "rgba(61,90,128,0.06)", border: "1px solid rgba(61,90,128,0.12)" }}
          >
            <Info size={12} style={{ color: "#3D5A80", flexShrink: 0, marginTop: 1 }} />
            <p className="text-[11px] leading-relaxed" style={{ color: "#3D5A80" }}>
              Reservation is non-binding. If your final refund is lower, the offer value adjusts
              proportionally. No money is debited until IT Dept. confirms.
            </p>
          </div>

          <button
            className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl text-white transition-all"
            style={{
              background: "#A86545",
              boxShadow: "0 2px 10px rgba(168,101,69,0.3)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = "#8B5038";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "#A86545";
            }}
          >
            Browse offers below
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function MarketplacePage() {
  const [offers, setOffers] = useState<MarketplaceOffer[]>([]);
  const [calculation, setCalculation] = useState<TaxCalculation | null>(null);
  const [redemption, setRedemption] = useState<RedeemResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  useEffect(() => {
    getOffers().then(setOffers).catch(() => {});
    calculate().then(setCalculation).catch(() => {});
  }, []);

  const refundAmount = calculation?.refund_or_payable ?? 0;
  const itrFiled = false; // would come from profile.itr_filed in a real integration
  const showPreClaimBanner = !bannerDismissed && refundAmount > 0 && !itrFiled;

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
        <p className="text-sm text-[var(--taxzy-stone)] mb-5">
          Convert your{" "}
          <span className="money font-semibold text-[var(--taxzy-success)]">{formatINR(refundAmount)}</span>{" "}
          refund into more value
        </p>
      </motion.div>

      {/* Pre-claim banner */}
      <AnimatePresence>
        {showPreClaimBanner && (
          <PreClaimBanner
            refundAmount={refundAmount}
            onDismiss={() => setBannerDismissed(true)}
          />
        )}
      </AnimatePresence>

      {refundAmount <= 0 && calculation && (
        <div className="bg-[var(--muted)] rounded-xl p-4 text-sm text-[var(--taxzy-stone)] mb-6">
          No refund to redeem this year. Come back once you have a refund due.
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
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
