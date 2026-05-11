"use client";
import { motion } from "framer-motion";

export function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 mb-4">
      <div className="w-7 h-7 rounded-full bg-[var(--taxzy-slate)] flex items-center justify-center text-white text-xs font-bold shrink-0">
        T
      </div>
      <div className="bg-[var(--muted)] px-4 py-3 rounded-[4px_12px_12px_12px] inline-flex gap-1 items-center">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="block w-2 h-2 rounded-full bg-[var(--taxzy-stone)]"
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}
      </div>
    </div>
  );
}
