"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";

const faqs = [
  {
    q: "Is it really free?",
    a: "Yes. ITR-1 and ITR-2 for salaried and freelance income — free, forever. No catch, no credit card.",
  },
  {
    q: "Is my data safe?",
    a: "AES-256 encryption at rest, TLS in transit. We never store your Aadhaar or login passwords. Read our security page for details.",
  },
  {
    q: "What if I have capital gains?",
    a: "The Pro plan covers equity, mutual fund, and property gains. It's ₹499/year — less than one CA visit.",
  },
  {
    q: "Can it replace my CA?",
    a: "For most salaried people, absolutely yes. For complex business structures, our CA Assist plan gives you a 30-min video call with a verified CA.",
  },
  {
    q: "Which ITR forms do you support?",
    a: "ITR-1 and ITR-2 on Free. ITR-3 and ITR-4 on Pro. We cover 95%+ of individual filers.",
  },
  {
    q: "What happens after I file?",
    a: "You receive an ITR-V email and Taxzy tracks acknowledgement status for you. We notify you when it's processed.",
  },
];

function Item({ q, a, open, onClick }: { q: string; a: string; open: boolean; onClick: () => void }) {
  return (
    <div
      className="rounded-xl overflow-hidden transition-all duration-150"
      style={{
        border: open ? "1px solid rgba(61,90,128,0.18)" : "1px solid rgba(216,214,209,0.7)",
        background: open ? "rgba(61,90,128,0.03)" : "#fff",
      }}
    >
      <button
        onClick={onClick}
        className="w-full flex items-center justify-between px-5 py-4 text-left"
      >
        <span
          className="text-sm font-semibold pr-4"
          style={{ color: "#1C1F23" }}
        >
          {q}
        </span>
        <div
          className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors duration-150"
          style={{
            background: open ? "#3D5A80" : "rgba(61,90,128,0.08)",
          }}
        >
          {open ? (
            <Minus size={13} style={{ color: "#fff" }} />
          ) : (
            <Plus size={13} style={{ color: "#3D5A80" }} />
          )}
        </div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            style={{ overflow: "hidden" }}
          >
            <p
              className="px-5 pb-4 text-sm leading-relaxed"
              style={{ color: "#6B7280" }}
            >
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  const toggle = (i: number) => setOpen(open === i ? null : i);

  return (
    <section className="py-24 px-6" style={{ background: "#fff" }}>
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
            FAQ
          </p>
          <h2
            className="text-3xl md:text-4xl font-extrabold tracking-tight"
            style={{ color: "#1C1F23" }}
          >
            The stuff everyone{" "}
            <span style={{ color: "#3D5A80" }}>wonders.</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-3">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, ease: "easeOut", delay: i * 0.05 }}
            >
              <Item
                q={faq.q}
                a={faq.a}
                open={open === i}
                onClick={() => toggle(i)}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
