"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

const plans = [
  {
    key: "free",
    name: "Free",
    monthly: 0,
    annual: 0,
    tag: null,
    features: [
      "ITR-1 & ITR-2 filing",
      "AI chat assistant",
      "26AS / AIS auto-fill",
      "1 filing per year",
      "Email support",
    ],
    cta: "Get started →",
    href: "/register",
    accent: false,
  },
  {
    key: "pro",
    name: "Pro",
    monthly: 599,
    annual: 499,
    tag: "Most popular",
    features: [
      "Everything in Free",
      "Capital gains (equity & MF)",
      "Business income (ITR-3 & 4)",
      "Priority support",
      "Unlimited filings",
    ],
    cta: "Start free trial →",
    href: "/register?plan=pro",
    accent: true,
  },
  {
    key: "ca",
    name: "CA Assist",
    monthly: 2499,
    annual: 1999,
    tag: null,
    features: [
      "Everything in Pro",
      "30-min CA video call",
      "CA sign-off on return",
      "Tax notice support",
      "Dedicated account manager",
    ],
    cta: "Book now →",
    href: "/register?plan=ca",
    accent: false,
  },
];

export default function Pricing() {
  const [annual, setAnnual] = useState(true);

  return (
    <section id="pricing" className="py-24 px-6" style={{ background: "#fff" }}>
      <div className="max-w-5xl mx-auto">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="text-center mb-12"
        >
          <p
            className="text-xs font-semibold uppercase tracking-[0.12em] mb-3"
            style={{ color: "#9CA3AF" }}
          >
            Pricing
          </p>
          <h2
            className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4"
            style={{ color: "#1C1F23" }}
          >
            Free for the other{" "}
            <span style={{ color: "#3D5A80" }}>70 million of you.</span>
          </h2>

          {/* Toggle */}
          <div
            className="inline-flex items-center rounded-xl p-1 gap-1"
            style={{ background: "#F3F2EF", border: "1px solid rgba(216,214,209,0.8)" }}
          >
            {(["monthly", "annual"] as const).map((opt) => {
              const active = (opt === "annual") === annual;
              return (
                <button
                  key={opt}
                  onClick={() => setAnnual(opt === "annual")}
                  className="relative text-xs font-semibold px-4 py-1.5 rounded-lg transition-colors duration-150"
                  style={{ color: active ? "#fff" : "#6B7280" }}
                >
                  {active && (
                    <motion.div
                      layoutId="pill"
                      className="absolute inset-0 rounded-lg"
                      style={{ background: "#3D5A80" }}
                      transition={{ type: "spring", stiffness: 380, damping: 34 }}
                    />
                  )}
                  <span className="relative z-10 capitalize">{opt}</span>
                  {opt === "annual" && (
                    <span
                      className="relative z-10 ml-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                      style={{
                        background: active ? "rgba(255,255,255,0.22)" : "rgba(22,163,74,0.1)",
                        color: active ? "#fff" : "#16A34A",
                      }}
                    >
                      Save 17%
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-5 items-start">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.key}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, ease: "easeOut", delay: i * 0.07 }}
              className="rounded-2xl p-7 flex flex-col"
              style={
                plan.accent
                  ? {
                      background: "rgba(61,90,128,0.04)",
                      border: "2px solid #3D5A80",
                      boxShadow: "0 8px 32px rgba(61,90,128,0.16)",
                    }
                  : {
                      background: "#fff",
                      border: "1px solid rgba(216,214,209,0.8)",
                      boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
                    }
              }
            >
              {/* Tag */}
              <div className="flex items-center justify-between mb-4">
                <span
                  className="text-sm font-bold"
                  style={{ color: plan.accent ? "#3D5A80" : "#1C1F23" }}
                >
                  {plan.name}
                </span>
                {plan.tag && (
                  <span
                    className="text-[10px] font-semibold px-2.5 py-1 rounded-full"
                    style={{ background: "#3D5A80", color: "#fff" }}
                  >
                    {plan.tag}
                  </span>
                )}
              </div>

              {/* Price */}
              <div className="mb-6">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={annual ? "annual" : "monthly"}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2 }}
                    className="font-extrabold tracking-tight"
                    style={{
                      fontSize: "2.2rem",
                      fontFamily: "JetBrains Mono, monospace",
                      color: "#1C1F23",
                      fontFeatureSettings: '"tnum"',
                    }}
                  >
                    {plan.monthly === 0
                      ? "₹0"
                      : `₹${annual ? plan.annual : plan.monthly}`}
                  </motion.p>
                </AnimatePresence>
                <p className="text-xs mt-0.5" style={{ color: "#9CA3AF" }}>
                  {plan.monthly === 0 ? "free forever" : `/ year${annual ? " (billed annually)" : " equiv."}`}
                </p>
              </div>

              {/* Features */}
              <ul className="space-y-2.5 mb-8 flex-1">
                {plan.features.map((feat) => (
                  <li key={feat} className="flex items-center gap-2.5">
                    <CheckCircle2
                      size={14}
                      className="flex-shrink-0"
                      style={{ color: plan.accent ? "#3D5A80" : "#16A34A" }}
                    />
                    <span className="text-xs" style={{ color: "#374151" }}>
                      {feat}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link
                href={plan.href}
                className="block text-center text-sm font-semibold py-2.5 rounded-xl transition-all duration-200"
                style={
                  plan.accent
                    ? {
                        background: "#3D5A80",
                        color: "#fff",
                        boxShadow: "0 2px 10px rgba(61,90,128,0.3)",
                      }
                    : {
                        background: "transparent",
                        color: "#3D5A80",
                        border: "1.5px solid rgba(61,90,128,0.3)",
                      }
                }
                onMouseEnter={(e) => {
                  if (plan.accent) {
                    (e.currentTarget as HTMLElement).style.background = "#1F3654";
                  } else {
                    (e.currentTarget as HTMLElement).style.background = "rgba(61,90,128,0.06)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (plan.accent) {
                    (e.currentTarget as HTMLElement).style.background = "#3D5A80";
                  } else {
                    (e.currentTarget as HTMLElement).style.background = "transparent";
                  }
                }}
              >
                {plan.cta}
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="text-center text-xs mt-8"
          style={{ color: "#9CA3AF" }}
        >
          No credit card required · Cancel any time · Secure checkout
        </motion.p>
      </div>
    </section>
  );
}
