"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Star, Users, FileText } from "lucide-react";

const headlineLines = [
  ["Your", "taxes,"],
  ["done", "in", "15", "min."],
];

export default function Hero() {
  return (
    <section
      className="min-h-screen flex items-center pt-20"
      style={{ background: "#F3F2EF" }}
    >
      {/* Subtle radial glow background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 70% 50%, rgba(61,90,128,0.06) 0%, transparent 70%)",
        }}
      />

      <div className="max-w-6xl mx-auto px-6 py-24 w-full relative">
        <div className="grid lg:grid-cols-[58%_42%] gap-16 items-center">

          {/* ── LEFT COLUMN ── */}
          <div>
            {/* AY pill */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: "easeOut", delay: 0.05 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-7"
              style={{
                background: "rgba(61,90,128,0.08)",
                color: "#3D5A80",
                border: "1px solid rgba(61,90,128,0.14)",
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  background: "#16A34A",
                  animation: "pulse 2s cubic-bezier(0.4,0,0.6,1) infinite",
                }}
              />
              AY 2025-26 &nbsp;·&nbsp; Free forever
            </motion.div>

            {/* Headline — word-by-word stagger */}
            <h1
              className="font-extrabold tracking-[-0.035em] leading-[1.04] mb-6"
              style={{ fontSize: "clamp(2.6rem, 5.5vw, 4.2rem)", color: "#1C1F23" }}
            >
              {headlineLines.map((words, li) => (
                <span key={li} className="block">
                  {words.map((word, wi) => (
                    <motion.span
                      key={wi}
                      initial={{ opacity: 0, y: 22 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.32,
                        ease: "easeOut",
                        delay: 0.12 + (li * 4 + wi) * 0.08,
                      }}
                      className="inline-block"
                      style={{ marginRight: "0.26em" }}
                    >
                      {word}
                    </motion.span>
                  ))}
                </span>
              ))}
            </h1>

            {/* Subtext */}
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: "easeOut", delay: 0.6 }}
              className="text-[1.1rem] leading-[1.7] mb-8 max-w-[460px]"
              style={{ color: "#6B7280" }}
            >
              Stop dreading ITR. Taxzy asks the right questions, calculates
              your refund, and files it — in plain English.
            </motion.p>

            {/* CTA row */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: "easeOut", delay: 0.72 }}
              className="flex flex-wrap items-center gap-3 mb-10"
            >
              <Link
                href="/register"
                className="inline-flex items-center gap-2 text-white text-sm font-semibold px-5 py-3 rounded-xl transition-all duration-200"
                style={{
                  background: "#3D5A80",
                  boxShadow: "0 2px 14px rgba(61,90,128,0.38)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "#1F3654";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 22px rgba(61,90,128,0.46)";
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "#3D5A80";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 14px rgba(61,90,128,0.38)";
                  (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                }}
              >
                File my taxes — it&apos;s free
                <ArrowRight size={15} />
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center gap-1 text-sm font-medium px-4 py-3 rounded-xl transition-all duration-150"
                style={{ color: "#3D5A80" }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(61,90,128,0.06)")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
              >
                See how it works ↓
              </a>
            </motion.div>

            {/* Social proof row */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.9 }}
              className="flex flex-wrap items-center gap-5"
            >
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={13} className="fill-[#F59E0B] text-[#F59E0B]" />
                ))}
                <span className="text-xs font-semibold ml-1.5" style={{ color: "#6B7280" }}>
                  4.9/5
                </span>
              </div>
              <div
                className="flex items-center gap-1.5 text-xs font-medium"
                style={{ color: "#6B7280" }}
              >
                <Users size={13} style={{ color: "#3D5A80" }} />
                82,000+ filed
              </div>
              <div
                className="flex items-center gap-1.5 text-xs font-medium"
                style={{ color: "#6B7280" }}
              >
                <FileText size={13} style={{ color: "#3D5A80" }} />
                ITR-1 &amp; ITR-2
              </div>
            </motion.div>
          </div>

          {/* ── RIGHT COLUMN — 3D card visual ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.55, ease: "easeOut", delay: 0.2 }}
            className="relative hidden lg:flex items-center justify-center"
            style={{ minHeight: 440 }}
          >
            {/* Background halo */}
            <div
              className="absolute rounded-full"
              style={{
                width: 360,
                height: 360,
                background: "radial-gradient(circle, rgba(61,90,128,0.1) 0%, transparent 70%)",
                top: "50%",
                left: "50%",
                transform: "translate(-50%,-50%)",
                filter: "blur(30px)",
              }}
            />

            {/* Card stack */}
            <div className="relative" style={{ width: 310, height: 390 }}>
              {/* Back card */}
              <div
                className="absolute rounded-2xl"
                style={{
                  width: 278,
                  height: 350,
                  top: 24,
                  left: 32,
                  background: "#D6E2EF",
                  border: "1px solid rgba(61,90,128,0.08)",
                  transform: "rotate(7deg)",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
                }}
              />
              {/* Mid card */}
              <div
                className="absolute rounded-2xl"
                style={{
                  width: 278,
                  height: 350,
                  top: 12,
                  left: 16,
                  background: "#E4EDF6",
                  border: "1px solid rgba(61,90,128,0.08)",
                  transform: "rotate(3.5deg)",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
                }}
              />

              {/* Front card — main document */}
              <motion.div
                animate={{ y: [0, -9, 0] }}
                transition={{ duration: 3, ease: "easeInOut", repeat: Infinity }}
                className="absolute rounded-2xl overflow-hidden"
                style={{
                  width: 280,
                  height: 350,
                  top: 0,
                  left: 0,
                  background: "#fff",
                  border: "1px solid rgba(61,90,128,0.1)",
                  boxShadow: "0 20px 56px rgba(61,90,128,0.22)",
                }}
              >
                {/* Card header */}
                <div
                  className="px-5 py-4"
                  style={{
                    borderBottom: "1px solid rgba(61,90,128,0.08)",
                    background: "rgba(61,90,128,0.025)",
                  }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold" style={{ color: "#3D5A80" }}>
                      Form 16 — AY 2025-26
                    </span>
                    <span
                      className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                      style={{ background: "#dcfce7", color: "#16A34A" }}
                    >
                      Verified ✓
                    </span>
                  </div>
                  <p className="text-[10px]" style={{ color: "#9CA3AF" }}>
                    Employer: Infosys Ltd.
                  </p>
                </div>

                {/* Card rows */}
                <div className="px-5 py-4 space-y-3.5">
                  {[
                    { label: "Gross Salary", value: "₹12,80,000" },
                    { label: "TDS Deducted", value: "₹18,200" },
                    { label: "80C Deductions", value: "₹1,50,000" },
                    { label: "HRA Exemption", value: "₹96,000" },
                  ].map((row) => (
                    <div key={row.label} className="flex items-center justify-between">
                      <span className="text-[11px]" style={{ color: "#6B7280" }}>
                        {row.label}
                      </span>
                      <span
                        className="text-[11px] font-semibold"
                        style={{ fontFamily: "JetBrains Mono, monospace", color: "#1C1F23" }}
                      >
                        {row.value}
                      </span>
                    </div>
                  ))}
                  <div
                    className="my-2"
                    style={{ height: 1, background: "rgba(61,90,128,0.07)" }}
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold" style={{ color: "#1C1F23" }}>
                      Net Tax Payable
                    </span>
                    <span
                      className="text-[11px] font-bold"
                      style={{ fontFamily: "JetBrains Mono, monospace", color: "#16A34A" }}
                    >
                      ₹0
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div
                    className="rounded-full overflow-hidden"
                    style={{ height: 4, background: "rgba(61,90,128,0.08)", marginTop: 12 }}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{ width: "78%", background: "#3D5A80" }}
                    />
                  </div>
                  <p className="text-[10px]" style={{ color: "#9CA3AF" }}>
                    Profile 78% complete
                  </p>
                </div>
              </motion.div>

              {/* Floating refund card */}
              <motion.div
                animate={{ y: [0, -7, 0] }}
                transition={{
                  duration: 2.6,
                  ease: "easeInOut",
                  repeat: Infinity,
                  delay: 0.6,
                }}
                className="absolute rounded-2xl px-4 py-3"
                style={{
                  bottom: -24,
                  right: -28,
                  background: "rgba(168,101,69,0.93)",
                  backdropFilter: "blur(14px)",
                  border: "1px solid rgba(255,255,255,0.18)",
                  boxShadow: "0 10px 36px rgba(168,101,69,0.38)",
                  color: "#fff",
                  minWidth: 175,
                }}
              >
                <p className="text-[9px] font-medium opacity-75 mb-0.5 uppercase tracking-wider">
                  Estimated refund
                </p>
                <p
                  className="text-[1.4rem] font-extrabold tracking-tight"
                  style={{ fontFamily: "JetBrains Mono, monospace" }}
                >
                  ₹28,450
                </p>
                <p className="text-[10px] opacity-70 mt-0.5">AI validated ✨</p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
