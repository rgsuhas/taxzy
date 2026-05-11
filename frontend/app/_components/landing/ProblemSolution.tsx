"use client";
import { motion } from "framer-motion";
import { X, CheckCircle2 } from "lucide-react";

const beforeItems = [
  "Dense government portal (e-Filing)",
  "Jargon everywhere — ITR, AIS, TDS, 80C",
  "CAs cost ₹2,000–10,000 per filing",
  "2–3 hours of confusion and guesswork",
  "Still not sure if it's correct",
];

const afterItems = [
  "Chat-style Q&A, plain English answers",
  "Every term explained on hover",
  "Free forever for ITR-1 and ITR-2",
  "Under 15 minutes for most filers",
  "AI validates everything before you file",
];

const inView = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
};

export default function ProblemSolution() {
  return (
    <section className="py-24 px-6" style={{ background: "#F3F2EF" }}>
      <div className="max-w-5xl mx-auto">
        <motion.div
          {...inView}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="text-center mb-14"
        >
          <p
            className="text-xs font-semibold uppercase tracking-[0.12em] mb-3"
            style={{ color: "#9CA3AF" }}
          >
            The problem & our fix
          </p>
          <h2
            className="text-3xl md:text-4xl font-extrabold tracking-tight"
            style={{ color: "#1C1F23" }}
          >
            Tax filing is broken.{" "}
            <span style={{ color: "#3D5A80" }}>We fixed it.</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-5">
          {/* BEFORE */}
          <motion.div
            {...inView}
            transition={{ duration: 0.38, ease: "easeOut", delay: 0.05 }}
            className="rounded-2xl p-7"
            style={{
              background: "#fff",
              border: "1px solid rgba(220,38,38,0.12)",
              boxShadow: "0 2px 16px rgba(0,0,0,0.04)",
            }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center text-base"
                style={{ background: "rgba(220,38,38,0.08)" }}
              >
                ❌
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "#9CA3AF" }}>
                  Before Taxzy
                </p>
                <p className="text-sm font-bold" style={{ color: "#DC2626" }}>
                  The painful way
                </p>
              </div>
            </div>

            <ul className="space-y-3.5">
              {beforeItems.map((item, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: 0.1 + i * 0.06 }}
                  className="flex items-start gap-3"
                >
                  <X
                    size={14}
                    className="flex-shrink-0 mt-0.5"
                    style={{ color: "#FCA5A5" }}
                  />
                  <span className="text-sm leading-snug" style={{ color: "#6B7280" }}>
                    {item}
                  </span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* AFTER */}
          <motion.div
            {...inView}
            transition={{ duration: 0.38, ease: "easeOut", delay: 0.12 }}
            className="rounded-2xl p-7"
            style={{
              background: "rgba(61,90,128,0.04)",
              border: "1px solid rgba(61,90,128,0.14)",
              boxShadow: "0 2px 16px rgba(61,90,128,0.07)",
            }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center text-base"
                style={{ background: "rgba(22,163,74,0.1)" }}
              >
                ✅
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "#9CA3AF" }}>
                  With Taxzy
                </p>
                <p className="text-sm font-bold" style={{ color: "#16A34A" }}>
                  The smart way
                </p>
              </div>
            </div>

            <ul className="space-y-3.5">
              {afterItems.map((item, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: 0.16 + i * 0.06 }}
                  className="flex items-start gap-3"
                >
                  <CheckCircle2
                    size={14}
                    className="flex-shrink-0 mt-0.5"
                    style={{ color: "#3D5A80" }}
                  />
                  <span className="text-sm leading-snug" style={{ color: "#374151" }}>
                    {item}
                  </span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
