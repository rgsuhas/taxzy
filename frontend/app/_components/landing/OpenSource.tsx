"use client";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const pillars = [
  {
    icon: (
      <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5" aria-hidden="true">
        <rect x="3" y="9" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.6" />
        <path d="M7 9V6a3 3 0 016 0v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <circle cx="10" cy="14" r="1.2" fill="currentColor" />
      </svg>
    ),
    title: "Data never leaves your server",
    body: "Tax documents, PAN, income data — all stored in your own database. The only external call is to the Gemini API with your own key.",
  },
  {
    icon: (
      <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5" aria-hidden="true">
        <rect x="2" y="5" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.6" />
        <path d="M6 5V4a4 4 0 018 0v1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M7 10h6M7 13h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    title: "One-command Docker deploy",
    body: "docker compose up and you're running — backend, frontend, and Postgres all wired together. No accounts, no cloud lock-in.",
  },
  {
    icon: (
      <svg viewBox="0 0 20 20" fill="none" className="w-5 h-5" aria-hidden="true">
        <path d="M10 2L2 7l8 5 8-5-8-5z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M2 13l8 5 8-5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M2 10l8 5 8-5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    ),
    title: "GPL-2.0 open source",
    body: "Full source code on GitHub. Audit the logic, extend it, or run a fork for your CA practice. No black boxes in your tax filing.",
  },
];

const terminalLines = [
  { text: "$ git clone https://github.com/rgsuhas/super-tax.git", color: "#9CA3AF" },
  { text: "$ cd super-tax && cp .env.example backend/.env", color: "#9CA3AF" },
  { text: "# Set GEMINI_API_KEY in backend/.env", color: "#6B7280" },
  { text: "$ docker compose up --build", color: "#9CA3AF" },
  { text: "", color: "" },
  { text: "✓ postgres started", color: "#16A34A" },
  { text: "✓ backend ready on :8000", color: "#16A34A" },
  { text: "✓ frontend ready on :3000", color: "#16A34A" },
];

export default function OpenSource() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section
      id="open-source"
      ref={ref}
      className="py-24 px-6"
      style={{ background: "#F3F2EF" }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="text-center mb-16"
        >
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-5"
            style={{
              background: "rgba(61,90,128,0.08)",
              color: "#3D5A80",
              border: "1px solid rgba(61,90,128,0.14)",
            }}
          >
            <svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
            </svg>
            Open source · GPL-2.0
          </div>

          <h2
            className="font-extrabold tracking-[-0.03em] mb-4"
            style={{ fontSize: "clamp(2rem, 4vw, 3rem)", color: "#1C1F23" }}
          >
            Your data, your machine.
          </h2>
          <p
            className="text-[1.05rem] leading-[1.7] max-w-[520px] mx-auto"
            style={{ color: "#6B7280" }}
          >
            Taxzy is fully open source and built to run locally. Sensitive tax data never
            has to leave a server you control.
          </p>
        </motion.div>

        {/* Two-column: pillars + terminal */}
        <div className="grid lg:grid-cols-2 gap-10 items-start">
          {/* Pillars */}
          <div className="space-y-5">
            {pillars.map((p, i) => (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, x: -16 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.38, ease: "easeOut", delay: 0.1 + i * 0.1 }}
                className="flex gap-4 p-5 rounded-2xl"
                style={{
                  background: "rgba(255,255,255,0.7)",
                  border: "1px solid rgba(216,214,209,0.8)",
                }}
              >
                <div
                  className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center"
                  style={{ background: "rgba(61,90,128,0.08)", color: "#3D5A80" }}
                >
                  {p.icon}
                </div>
                <div>
                  <p className="text-sm font-semibold mb-1" style={{ color: "#1C1F23" }}>
                    {p.title}
                  </p>
                  <p className="text-sm leading-relaxed" style={{ color: "#6B7280" }}>
                    {p.body}
                  </p>
                </div>
              </motion.div>
            ))}

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.38, ease: "easeOut", delay: 0.45 }}
              className="flex flex-wrap gap-3 pt-2"
            >
              <a
                href="https://github.com/rgsuhas/super-tax"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-xl text-white transition-all duration-200"
                style={{
                  background: "#1C1F23",
                  boxShadow: "0 2px 10px rgba(28,31,35,0.28)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "#3D5A80";
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "#1C1F23";
                  (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                }}
              >
                <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
                  <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
                </svg>
                View source on GitHub
              </a>
              <a
                href="/docs/self-hosting"
                className="inline-flex items-center gap-1.5 text-sm font-semibold px-5 py-2.5 rounded-xl transition-all duration-150"
                style={{
                  color: "#3D5A80",
                  background: "rgba(61,90,128,0.07)",
                  border: "1px solid rgba(61,90,128,0.14)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "rgba(61,90,128,0.13)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "rgba(61,90,128,0.07)";
                }}
              >
                Self-host in 5 min →
              </a>
            </motion.div>
          </div>

          {/* Terminal */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.45, ease: "easeOut", delay: 0.2 }}
            className="rounded-2xl overflow-hidden"
            style={{
              background: "#1C1F23",
              border: "1px solid rgba(255,255,255,0.06)",
              boxShadow: "0 20px 60px rgba(28,31,35,0.3)",
            }}
          >
            {/* Terminal chrome */}
            <div
              className="flex items-center gap-2 px-5 py-3.5"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
            >
              {["#FC605B", "#FDBC40", "#34C84A"].map((c) => (
                <div key={c} className="w-3 h-3 rounded-full" style={{ background: c }} />
              ))}
              <span className="ml-2 text-xs font-medium" style={{ color: "#6B7280" }}>
                Terminal
              </span>
            </div>

            {/* Terminal body */}
            <div className="px-5 py-5 space-y-1.5 font-mono text-[13px] leading-relaxed">
              {terminalLines.map((line, i) => (
                <motion.p
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={inView ? { opacity: 1 } : {}}
                  transition={{ duration: 0.2, delay: 0.4 + i * 0.12 }}
                  style={{ color: line.color || "transparent", minHeight: "1.2em" }}
                >
                  {line.text}
                </motion.p>
              ))}
              <motion.span
                initial={{ opacity: 0 }}
                animate={inView ? { opacity: [0, 1, 0] } : {}}
                transition={{ duration: 1, repeat: Infinity, delay: 1.8 }}
                className="inline-block w-2 h-4 align-middle"
                style={{ background: "#3D5A80", borderRadius: 2 }}
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
