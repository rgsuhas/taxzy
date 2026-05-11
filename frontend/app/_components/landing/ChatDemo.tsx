"use client";
import { useState, useEffect, useRef } from "react";
import { motion, useInView, useMotionValue, useSpring, useTransform } from "framer-motion";

type Message = { from: "bot" | "user"; text: string; delay: number };

const messages: Message[] = [
  { from: "bot",  text: "👋 Hey! Do you have a Form 16 from your employer this year?", delay: 0 },
  { from: "user", text: "Yes, I do ✓", delay: 1200 },
  { from: "bot",  text: "Great — your employer paid ₹18,200 in taxes for you. Let me check if you're owed any of that back. 👀", delay: 2200 },
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

export default function ChatDemo() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const [visible, setVisible] = useState<boolean[]>([false, false, false]);
  const [showRefund, setShowRefund] = useState(false);

  useEffect(() => {
    if (!inView) return;
    messages.forEach((msg, i) => {
      setTimeout(() => {
        setVisible((v) => {
          const next = [...v];
          next[i] = true;
          return next;
        });
      }, msg.delay + 300);
    });
    setTimeout(() => setShowRefund(true), 4200);
  }, [inView]);

  return (
    <section
      className="py-24 px-6"
      style={{ background: "#F3F2EF" }}
    >
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="text-center mb-14"
        >
          <p
            className="text-xs font-semibold uppercase tracking-[0.12em] mb-3"
            style={{ color: "#9CA3AF" }}
          >
            Live demo
          </p>
          <h2
            className="text-3xl md:text-4xl font-extrabold tracking-tight"
            style={{ color: "#1C1F23" }}
          >
            This is what filing{" "}
            <span style={{ color: "#3D5A80" }}>feels like.</span>
          </h2>
        </motion.div>

        <div className="flex justify-center" ref={ref}>
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.97 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="w-full max-w-lg rounded-2xl overflow-hidden"
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
                  Taxzy
                </span>
              </div>
              <div className="flex gap-1.5">
                {["#FC605B", "#FDBC40", "#34C84A"].map((c) => (
                  <div key={c} className="w-3 h-3 rounded-full" style={{ background: c }} />
                ))}
              </div>
            </div>

            {/* Chat body */}
            <div className="px-5 py-5 space-y-4 min-h-[260px]">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8, scale: 0.97 }}
                  animate={visible[i] ? { opacity: 1, y: 0, scale: 1 } : {}}
                  transition={{ duration: 0.28, ease: "easeOut" }}
                  className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className="text-sm leading-snug px-4 py-2.5 rounded-2xl max-w-[82%]"
                    style={
                      msg.from === "bot"
                        ? {
                            background: "rgba(61,90,128,0.06)",
                            color: "#1C1F23",
                            borderRadius: "4px 18px 18px 18px",
                          }
                        : {
                            background: "#3D5A80",
                            color: "#fff",
                            borderRadius: "18px 18px 4px 18px",
                          }
                    }
                  >
                    {msg.text}
                  </div>
                </motion.div>
              ))}

              {/* Refund result card */}
              <motion.div
                initial={{ opacity: 0, y: 12, scale: 0.95 }}
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
                    ✨ Estimated refund
                  </p>
                  <p
                    className="text-2xl font-extrabold text-white"
                    style={{ fontFamily: "JetBrains Mono, monospace" }}
                  >
                    <CountUp to={28450} visible={showRefund} />
                  </p>
                </div>
                <button
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-white/80 font-bold text-base transition-all"
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
                className="w-9 h-9 rounded-xl flex items-center justify-center text-white transition-all"
                style={{ background: "#3D5A80" }}
              >
                ↑
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
