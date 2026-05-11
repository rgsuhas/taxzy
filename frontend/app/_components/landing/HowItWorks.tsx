"use client";
import { motion } from "framer-motion";

const steps = [
  {
    num: "01",
    emoji: "📋",
    title: "Connect your 26AS or AIS",
    desc: "Link your form 26AS — we pull your TDS, salary, interest income, and capital gains automatically.",
  },
  {
    num: "02",
    emoji: "🤖",
    title: "Chat with AI",
    desc: "Answer simple questions in plain English. No jargon. Taxzy picks the best tax regime for you.",
  },
  {
    num: "03",
    emoji: "✅",
    title: "File & done",
    desc: "One click to submit to the IT portal. Get your ITR-V and we track acknowledgement for you.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 px-6" style={{ background: "#fff" }}>
      <div className="max-w-5xl mx-auto">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="text-center mb-16"
        >
          <p
            className="text-xs font-semibold uppercase tracking-[0.12em] mb-3"
            style={{ color: "#9CA3AF" }}
          >
            How it works
          </p>
          <h2
            className="text-3xl md:text-4xl font-extrabold tracking-tight"
            style={{ color: "#1C1F23" }}
          >
            Three steps to done
          </h2>
        </motion.div>

        {/* Steps */}
        <div className="relative flex flex-col md:flex-row gap-6 md:gap-0 items-stretch">
          {steps.map((step, i) => (
            <div key={i} className="relative flex-1 flex flex-col">
              {/* Connecting line (desktop) */}
              {i < steps.length - 1 && (
                <div
                  className="hidden md:block absolute top-[52px] z-10"
                  style={{ left: "calc(50% + 52px)", width: "calc(100% - 104px)" }}
                >
                  <motion.svg
                    width="100%"
                    height="20"
                    viewBox="0 0 120 20"
                    fill="none"
                    preserveAspectRatio="none"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.3 + i * 0.2 }}
                  >
                    <motion.path
                      d="M0 10 Q60 2 120 10"
                      stroke="#3D5A80"
                      strokeWidth="1.5"
                      strokeDasharray="5 4"
                      strokeLinecap="round"
                      fill="none"
                      initial={{ pathLength: 0, opacity: 0 }}
                      whileInView={{ pathLength: 1, opacity: 0.5 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, ease: "easeOut", delay: 0.4 + i * 0.2 }}
                    />
                    <motion.path
                      d="M112 6 L120 10 L112 14"
                      stroke="#3D5A80"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 0.5 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.2, delay: 0.9 + i * 0.2 }}
                    />
                  </motion.svg>
                </div>
              )}

              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, ease: "easeOut", delay: i * 0.08 }}
                className="relative rounded-2xl p-7 mx-2 h-full flex flex-col"
                style={{
                  background: "#fff",
                  border: "1px solid rgba(216,214,209,0.8)",
                  boxShadow: "0 2px 14px rgba(0,0,0,0.04)",
                  overflow: "hidden",
                }}
              >
                {/* Watermark number */}
                <span
                  className="absolute right-4 top-2 font-extrabold select-none pointer-events-none"
                  style={{
                    fontSize: "4.5rem",
                    lineHeight: 1,
                    color: "#3D5A80",
                    opacity: 0.06,
                    fontFamily: "JetBrains Mono, monospace",
                  }}
                >
                  {step.num}
                </span>

                {/* Step badge */}
                <div className="flex items-center gap-3 mb-5">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                    style={{ background: "rgba(61,90,128,0.08)" }}
                  >
                    {step.emoji}
                  </div>
                  <span
                    className="text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-lg"
                    style={{ background: "rgba(61,90,128,0.06)", color: "#3D5A80" }}
                  >
                    Step {step.num}
                  </span>
                </div>

                <h3
                  className="text-base font-bold mb-2 leading-snug"
                  style={{ color: "#1C1F23" }}
                >
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "#6B7280" }}>
                  {step.desc}
                </p>
              </motion.div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
