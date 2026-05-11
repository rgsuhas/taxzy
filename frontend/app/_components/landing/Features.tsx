"use client";
import { motion } from "framer-motion";
import { Bot, Receipt, ShieldCheck, IndianRupee, Clock, Lock } from "lucide-react";

const features = [
  {
    Icon: Bot,
    title: "AI that speaks your language",
    body: "Ask 'Will I get a refund?' and actually get an answer — not a PDF. Taxzy explains every step in plain English.",
  },
  {
    Icon: Receipt,
    title: "Auto-fetch from 26AS & AIS",
    body: "Link once. We pull your TDS, interest income, and capital gains automatically. No manual entry.",
  },
  {
    Icon: ShieldCheck,
    title: "Validates before you file",
    body: "Catches common mistakes — missing HRA claims, wrong regime selection, unclaimed deductions.",
  },
  {
    Icon: IndianRupee,
    title: "Free for most people",
    body: "ITR-1 and ITR-2 are free, forever. Pay only if you have complex capital gains or business income.",
  },
  {
    Icon: Clock,
    title: "Under 15 minutes",
    body: "Not a marketing claim. Median time for salaried filers: 11 minutes. We measured it.",
  },
  {
    Icon: Lock,
    title: "Bank-grade encryption",
    body: "AES-256 at rest, TLS in transit. We never store your Aadhaar or passwords — ever.",
  },
];

export default function Features() {
  return (
    <section
      id="features"
      className="py-24 px-6"
      style={{ background: "#FAF9F6" }}
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
            Features
          </p>
          <h2
            className="text-3xl md:text-4xl font-extrabold tracking-tight"
            style={{ color: "#1C1F23" }}
          >
            Everything you need.{" "}
            <span style={{ color: "#3D5A80" }}>Nothing you don't.</span>
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map(({ Icon, title, body }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.32, ease: "easeOut", delay: i * 0.06 }}
              whileHover={{ y: -4, transition: { duration: 0.18, ease: "easeOut" } }}
              className="rounded-2xl p-6 cursor-default"
              style={{
                background: "#fff",
                border: "1px solid rgba(216,214,209,0.7)",
                boxShadow: "0 1px 8px rgba(0,0,0,0.03)",
                transition: "box-shadow 180ms ease-out",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow =
                  "0 8px 28px rgba(61,90,128,0.1)";
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(61,90,128,0.18)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow =
                  "0 1px 8px rgba(0,0,0,0.03)";
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(216,214,209,0.7)";
              }}
            >
              {/* Icon circle */}
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                style={{ background: "rgba(61,90,128,0.08)" }}
              >
                <Icon size={20} style={{ color: "#3D5A80" }} />
              </div>

              <h3
                className="text-sm font-bold mb-2 leading-snug"
                style={{ color: "#1C1F23" }}
              >
                {title}
              </h3>
              <p className="text-xs leading-relaxed" style={{ color: "#6B7280" }}>
                {body}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
