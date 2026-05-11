"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Clock, CreditCard } from "lucide-react";

export default function FinalCTA() {
  return (
    <section
      className="py-28 px-6 relative overflow-hidden"
      style={{ background: "#3D5A80" }}
    >
      {/* Radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 40%, rgba(255,255,255,0.07) 0%, transparent 70%)",
        }}
      />

      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="max-w-2xl mx-auto relative text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <p
            className="text-xs font-semibold uppercase tracking-[0.14em] mb-5"
            style={{ color: "rgba(255,255,255,0.55)" }}
          >
            AY 2025-26 filing is open
          </p>

          <h2
            className="font-extrabold tracking-tight leading-[1.1] mb-6"
            style={{
              fontSize: "clamp(2rem, 4.5vw, 2.8rem)",
              color: "#fff",
            }}
          >
            Filing opens April 1st.
            <br />
            <span style={{ color: "rgba(255,255,255,0.85)" }}>
              Start for free today.
            </span>
          </h2>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, ease: "easeOut", delay: 0.12 }}
          >
            <Link
              href="/register"
              className="inline-flex items-center gap-2 text-sm font-semibold px-6 py-3.5 rounded-xl transition-all duration-200"
              style={{
                background: "#fff",
                color: "#3D5A80",
                boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = "#F3F2EF";
                (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 32px rgba(0,0,0,0.28)";
                (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = "#fff";
                (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 20px rgba(0,0,0,0.2)";
                (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
              }}
            >
              File my taxes — it&apos;s free
              <ArrowRight size={15} />
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.22 }}
            className="flex items-center justify-center flex-wrap gap-5 mt-6"
          >
            {[
              { Icon: CreditCard, label: "No credit card" },
              { Icon: ShieldCheck, label: "No jargon" },
              { Icon: Clock, label: "Under 15 min" },
            ].map(({ Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-1.5 text-xs font-medium"
                style={{ color: "rgba(255,255,255,0.6)" }}
              >
                <Icon size={13} style={{ color: "rgba(255,255,255,0.5)" }} />
                {label}
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
