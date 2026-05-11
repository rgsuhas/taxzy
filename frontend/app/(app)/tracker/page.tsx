"use client";
import { useEffect, useState } from "react";
import { getRefundStatus } from "@/lib/api";
import { RefundTimeline } from "@/components/tracker/RefundTimeline";
import { motion } from "framer-motion";
import type { RefundStatus } from "@/types/api";
import { MapPin } from "lucide-react";

export default function TrackerPage() {
  const [status, setStatus] = useState<RefundStatus | null>(null);

  useEffect(() => {
    getRefundStatus().then(setStatus).catch(() => {});
  }, []);

  return (
    <div className="p-6 max-w-xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
        <div className="flex items-center gap-2 mb-1">
          <MapPin size={20} className="text-[var(--taxzy-slate)]" />
          <h1 className="text-xl font-bold text-[var(--foreground)]">Refund tracker</h1>
        </div>
        <p className="text-sm text-[var(--taxzy-stone)] mb-6">Track the status of your income tax refund</p>
      </motion.div>

      {status ? (
        <RefundTimeline status={status} />
      ) : (
        <div className="animate-pulse space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex gap-4">
              <div className="w-6 h-6 rounded-full bg-[var(--muted)]" />
              <div className="flex-1 h-12 rounded-lg bg-[var(--muted)]" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
