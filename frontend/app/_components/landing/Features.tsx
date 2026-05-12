"use client";
import { motion } from "framer-motion";
import { Bot, Receipt, ShieldCheck, IndianRupee, Clock, Lock, Plug } from "lucide-react";

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

const MCP_TOOLS = [
  "calculate_tax",
  "get_tax_profile",
  "verify_pan",
  "parse_document",
  "ask_tax_question",
  "generate_itr_xml",
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

        {/* MCP banner */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
          className="mt-10 rounded-2xl overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #1C2F45 0%, #3D5A80 100%)",
            border: "1px solid rgba(61,90,128,0.3)",
            boxShadow: "0 8px 32px rgba(28,47,69,0.22)",
          }}
        >
          <div className="p-8 md:p-10 flex flex-col md:flex-row gap-8 items-start md:items-center">
            {/* Left — copy */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2.5 mb-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(255,255,255,0.12)" }}
                >
                  <Plug size={16} style={{ color: "#fff" }} />
                </div>
                <span
                  className="text-[10px] font-bold uppercase tracking-[0.14em] px-2 py-0.5 rounded-full"
                  style={{ background: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.8)" }}
                >
                  MCP Server
                </span>
              </div>
              <h3
                className="text-xl md:text-2xl font-extrabold tracking-tight mb-2"
                style={{ color: "#fff" }}
              >
                Plug Taxzy into any AI agent
              </h3>
              <p
                className="text-sm leading-relaxed max-w-lg"
                style={{ color: "rgba(255,255,255,0.65)" }}
              >
                Taxzy ships as a{" "}
                <span style={{ color: "rgba(255,255,255,0.9)", fontWeight: 600 }}>
                  Model Context Protocol server
                </span>{" "}
                — connect it to Claude, Cursor, or any MCP-compatible agent and let your AI
                assistant calculate tax, verify PANs, and generate ITR XML directly from chat.
              </p>
              <p
                className="mt-3 text-xs font-mono px-3 py-1.5 rounded-lg inline-block"
                style={{ background: "rgba(0,0,0,0.3)", color: "rgba(255,255,255,0.7)" }}
              >
                claude mcp add taxzy -- python backend/mcp_server.py
              </p>
            </div>

            {/* Right — tool pill list */}
            <div className="flex-shrink-0 flex flex-wrap gap-2 md:max-w-[260px]">
              {MCP_TOOLS.map((tool, i) => (
                <motion.span
                  key={tool}
                  initial={{ opacity: 0, scale: 0.88 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.22, delay: 0.18 + i * 0.05 }}
                  className="text-[11px] font-mono px-2.5 py-1 rounded-lg"
                  style={{
                    background: "rgba(255,255,255,0.1)",
                    color: "rgba(255,255,255,0.75)",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  {tool}()
                </motion.span>
              ))}
              <span
                className="text-[11px] font-mono px-2.5 py-1 rounded-lg"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  color: "rgba(255,255,255,0.4)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                +5 more
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
