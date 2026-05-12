"use client";
import { useState, useEffect, useRef } from "react";
import { motion, useInView, useMotionValue, useSpring, useTransform } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Star, Users, FileText } from "lucide-react";

const headlineLines = [
  ["Your", "taxes,"],
  ["done", "in", "15", "min."],
];

type Message = { from: "bot" | "user"; text: string; delay: number };

const chatMessages: Message[] = [
  { from: "bot",  text: "Hey! Do you have a Form 16 from your employer this year?", delay: 0 },
  { from: "user", text: "Yes, I do", delay: 1200 },
  { from: "bot",  text: "Your employer paid ₹18,200 in taxes for you. Let me check if you're owed any of that back.", delay: 2200 },
];

function CountUp({ to, visible }: { to: number; visible: boolean }) {
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { stiffness: 60, damping: 22 });
  const rounded = useTransform(spring, (v) =>
    `₹${Math.round(v).toLocaleString("en-IN")}`
  );
  useEffect(() => {
    if (visible) mv.set(to);
  }, [visible, to, mv]);
  return <motion.span>{rounded}</motion.span>;
}

export default function Hero() {
  const chatRef = useRef<HTMLDivElement>(null);
  const inView = useInView(chatRef, { once: true, margin: "-60px" });
  const [msgVisible, setMsgVisible] = useState<boolean[]>([false, false, false]);
  const [showRefund, setShowRefund] = useState(false);

  useEffect(() => {
    if (!inView) return;
    chatMessages.forEach((msg, i) => {
      setTimeout(() => {
        setMsgVisible((v) => { const n = [...v]; n[i] = true; return n; });
      }, msg.delay + 300);
    });
    setTimeout(() => setShowRefund(true), 4000);
  }, [inView]);

  return (
    <section
      className="min-h-screen flex items-center pt-20"
      style={{ background: "#F3F2EF" }}
    >
      {/* Subtle radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 70% 50%, rgba(61,90,128,0.06) 0%, transparent 70%)",
        }}
      />

      <div className="max-w-6xl mx-auto px-6 py-24 w-full relative">
        <div className="grid lg:grid-cols-[55%_45%] gap-14 items-center">

          {/* LEFT COLUMN */}
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

            {/* Headline */}
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
                See how it works
              </a>
            </motion.div>

            {/* Social proof */}
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
              <div className="flex items-center gap-1.5 text-xs font-medium" style={{ color: "#6B7280" }}>
                <Users size={13} style={{ color: "#3D5A80" }} />
                82,000+ filed
              </div>
              <div className="flex items-center gap-1.5 text-xs font-medium" style={{ color: "#6B7280" }}>
                <FileText size={13} style={{ color: "#3D5A80" }} />
                ITR-1 &amp; ITR-2
              </div>
            </motion.div>
          </div>

          {/* RIGHT COLUMN — live chat demo */}
          <motion.div
            ref={chatRef}
            initial={{ opacity: 0, scale: 0.95, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.55, ease: "easeOut", delay: 0.2 }}
            className="hidden lg:block"
          >
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                background: "rgba(255,255,255,0.92)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(216,214,209,0.8)",
                boxShadow: "0 24px 64px rgba(61,90,128,0.14)",
              }}
            >
              {/* Window chrome */}
              <div
                className="flex items-center justify-between px-5 py-3.5"
                style={{
                  borderBottom: "1px solid rgba(216,214,209,0.6)",
                  background: "rgba(61,90,128,0.03)",
                }}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded-lg flex items-center justify-center"
                    style={{ background: "#3D5A80" }}
                  >
                    <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5">
                      <path d="M3 4h10M3 8h7M3 12h5" stroke="white" strokeWidth="1.7" strokeLinecap="round" />
                    </svg>
                  </div>
                  <span className="text-sm font-semibold" style={{ color: "#1C1F23" }}>
                    T<span style={{ color: "#3D5A80" }}>a</span>x<span style={{ color: "#3D5A80" }}>z</span>y
                  </span>
                </div>
                <div className="flex gap-1.5">
                  {["#FC605B", "#FDBC40", "#34C84A"].map((c) => (
                    <div key={c} className="w-3 h-3 rounded-full" style={{ background: c }} />
                  ))}
                </div>
              </div>

              {/* Chat body */}
              <div className="px-5 py-5 space-y-3.5 min-h-[220px]">
                {chatMessages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8, scale: 0.97 }}
                    animate={msgVisible[i] ? { opacity: 1, y: 0, scale: 1 } : {}}
                    transition={{ duration: 0.28, ease: "easeOut" }}
                    className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className="text-sm leading-snug px-4 py-2.5 rounded-2xl max-w-[84%]"
                      style={
                        msg.from === "bot"
                          ? { background: "rgba(61,90,128,0.06)", color: "#1C1F23", borderRadius: "4px 18px 18px 18px" }
                          : { background: "#3D5A80", color: "#fff", borderRadius: "18px 18px 4px 18px" }
                      }
                    >
                      {msg.text}
                    </div>
                  </motion.div>
                ))}

                {/* Refund result card */}
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.96 }}
                  animate={showRefund ? { opacity: 1, y: 0, scale: 1 } : {}}
                  transition={{ duration: 0.38, ease: "easeOut" }}
                  className="rounded-2xl px-5 py-4 flex items-center justify-between"
                  style={{
                    background: "rgba(168,101,69,0.92)",
                    boxShadow: "0 6px 24px rgba(168,101,69,0.3)",
                  }}
                >
                  <div>
                    <p className="text-[10px] font-semibold text-white/70 uppercase tracking-wider mb-0.5">
                      Estimated refund
                    </p>
                    <p
                      className="text-2xl font-extrabold text-white"
                      style={{ fontFamily: "JetBrains Mono, monospace" }}
                    >
                      <CountUp to={28450} visible={showRefund} />
                    </p>
                  </div>
                  <button
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-white/80 font-bold text-base"
                    style={{ background: "rgba(255,255,255,0.2)" }}
                  >
                    →
                  </button>
                </motion.div>
              </div>

              {/* Input bar */}
              <div
                className="px-5 py-3 flex items-center gap-3"
                style={{ borderTop: "1px solid rgba(216,214,209,0.6)" }}
              >
                <div
                  className="flex-1 rounded-xl px-4 py-2.5 text-sm"
                  style={{
                    background: "rgba(61,90,128,0.05)",
                    color: "#9CA3AF",
                    border: "1px solid rgba(61,90,128,0.1)",
                  }}
                >
                  Type a question…
                </div>
                <button
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-white"
                  style={{ background: "#3D5A80" }}
                >
                  ↑
                </button>
              </div>
            </div>

            {/* Label beneath */}
            <p className="text-center text-[11px] font-medium mt-3" style={{ color: "#9CA3AF" }}>
              Live demo — see it in action
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
