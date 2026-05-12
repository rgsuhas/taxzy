"use client";
import { motion } from "framer-motion";
import { CalendarDays, AlertCircle, CheckCircle2, Clock } from "lucide-react";

interface DeadlineItem {
  date: string;
  label: string;
  detail: string;
  status: "done" | "upcoming" | "urgent";
}

const AY = "2025-26";
const TODAY = new Date();

function parseDate(s: string) {
  const [d, m, y] = s.split("/").map(Number);
  return new Date(y, m - 1, d);
}

function daysUntil(dateStr: string) {
  const target = parseDate(dateStr);
  const diff = Math.ceil((target.getTime() - TODAY.getTime()) / 86400000);
  return diff;
}

const deadlines: DeadlineItem[] = [
  {
    date: "15/06/2025",
    label: "Advance Tax – Q1",
    detail: "15% of estimated annual tax due",
    status: daysUntil("15/06/2025") < 0 ? "done" : daysUntil("15/06/2025") <= 14 ? "urgent" : "upcoming",
  },
  {
    date: "31/07/2025",
    label: "ITR Filing Deadline",
    detail: `AY ${AY} — individuals & salaried (non-audit)`,
    status: daysUntil("31/07/2025") < 0 ? "done" : daysUntil("31/07/2025") <= 14 ? "urgent" : "upcoming",
  },
  {
    date: "15/09/2025",
    label: "Advance Tax – Q2",
    detail: "45% of estimated annual tax due",
    status: daysUntil("15/09/2025") < 0 ? "done" : daysUntil("15/09/2025") <= 14 ? "urgent" : "upcoming",
  },
  {
    date: "31/10/2025",
    label: "Belated / Revised ITR",
    detail: `Last date to file revised or belated ITR for AY ${AY}`,
    status: daysUntil("31/10/2025") < 0 ? "done" : daysUntil("31/10/2025") <= 14 ? "urgent" : "upcoming",
  },
  {
    date: "15/12/2025",
    label: "Advance Tax – Q3",
    detail: "75% of estimated annual tax due",
    status: daysUntil("15/12/2025") < 0 ? "done" : daysUntil("15/12/2025") <= 14 ? "urgent" : "upcoming",
  },
  {
    date: "15/03/2026",
    label: "Advance Tax – Q4",
    detail: "100% of estimated annual tax due",
    status: daysUntil("15/03/2026") < 0 ? "done" : daysUntil("15/03/2026") <= 14 ? "urgent" : "upcoming",
  },
];

const statusStyle = {
  done:     { icon: CheckCircle2, color: "#9CA3AF", bg: "rgba(156,163,175,0.08)", label: "Filed" },
  upcoming: { icon: CalendarDays, color: "#3D5A80", bg: "rgba(61,90,128,0.07)",  label: "Upcoming" },
  urgent:   { icon: AlertCircle,  color: "#DC2626", bg: "rgba(220,38,38,0.07)",  label: "Due soon" },
};

function formatDate(dateStr: string) {
  const d = parseDate(dateStr);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export function FilingCalendar() {
  const next = deadlines.find((d) => d.status !== "done");
  const daysLeft = next ? daysUntil(next.date) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: 0.4 }}
      className="rounded-2xl overflow-hidden"
      style={{
        background: "var(--card)",
        border: "1px solid var(--border)",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-4 border-b"
        style={{ borderColor: "var(--border)" }}
      >
        <div className="flex items-center gap-2">
          <CalendarDays size={16} className="text-[var(--taxzy-slate)]" />
          <span className="text-sm font-semibold text-[var(--foreground)]">
            ITR Filing Calendar
          </span>
          <span
            className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
            style={{ background: "rgba(61,90,128,0.1)", color: "#3D5A80" }}
          >
            AY {AY}
          </span>
        </div>
        {daysLeft !== null && daysLeft > 0 && (
          <div
            className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full"
            style={
              daysLeft <= 14
                ? { background: "rgba(220,38,38,0.08)", color: "#DC2626" }
                : { background: "rgba(61,90,128,0.08)", color: "#3D5A80" }
            }
          >
            <Clock size={10} />
            {daysLeft}d left
          </div>
        )}
      </div>

      {/* Timeline */}
      <div className="divide-y" style={{ borderColor: "var(--border)" }}>
        {deadlines.map((item, i) => {
          const s = statusStyle[item.status];
          const Icon = s.icon;
          return (
            <div
              key={i}
              className="flex items-center gap-3 px-5 py-3.5"
              style={{ opacity: item.status === "done" ? 0.45 : 1 }}
            >
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: s.bg }}
              >
                <Icon size={14} style={{ color: s.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className="text-xs font-semibold leading-tight truncate"
                  style={{ color: "var(--foreground)" }}
                >
                  {item.label}
                </p>
                <p
                  className="text-[10px] leading-tight mt-0.5 truncate"
                  style={{ color: "var(--taxzy-stone)" }}
                >
                  {item.detail}
                </p>
              </div>
              <div className="flex-shrink-0 text-right">
                <p
                  className="text-[11px] font-semibold tabular-nums"
                  style={{ color: s.color }}
                >
                  {formatDate(item.date)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
