"use client";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { Copy, CheckCircle } from "lucide-react";
import type { RedeemResponse } from "@/types/api";

interface Props {
  result: RedeemResponse;
  onClose: () => void;
}

export function ConfettiRedemption({ result, onClose }: Props) {
  const [copied, setCopied] = useState(false);
  const firedRef = useRef(false);

  useEffect(() => {
    if (firedRef.current) return;
    firedRef.current = true;
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
      colors: ["#3D5A80", "#A86545", "#1F3654", "#C4784F", "#ffffff"],
    });
  }, []);

  const copy = async () => {
    await navigator.clipboard.writeText(result.voucher_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.25 }}
          className="bg-[var(--card)] rounded-2xl p-8 max-w-sm w-full mx-4 text-center shadow-xl"
        >
          <CheckCircle size={40} className="text-[var(--taxzy-success)] mx-auto mb-4" />
          <p className="font-bold text-xl text-[var(--foreground)] mb-1">Redeemed!</p>
          <p className="text-sm text-[var(--taxzy-stone)] mb-6">
            Your {result.brand} voucher is ready
          </p>

          <div className="bg-[var(--muted)] rounded-xl px-4 py-3 flex items-center justify-between mb-6">
            <span className="money text-lg font-semibold tracking-widest text-[var(--foreground)]">
              {result.voucher_code}
            </span>
            <button onClick={copy} className="text-[var(--taxzy-slate)] ml-3">
              {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
            </button>
          </div>

          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-lg bg-[var(--taxzy-slate)] text-white text-sm font-semibold"
          >
            Done
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
