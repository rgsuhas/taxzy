"use client";
import { useRef } from "react";
import { motion } from "framer-motion";
import { Star, AlertTriangle, Lock, Clock, XCircle } from "lucide-react";

const frustrations = [
  {
    type: "portal-error",
    title: "e-Filing Portal",
    url: "incometax.gov.in",
    body: "Session expired. Please login again to continue filing your return.",
    sub: "Your unsaved progress has been lost.",
    icon: XCircle,
    color: "#DC2626",
    bg: "#FEF2F2",
    border: "#FECACA",
  },
  {
    type: "paywall",
    title: "ClearTax Pro",
    url: "cleartax.in",
    body: "Capital gains filing is available only on our paid plans.",
    sub: "Upgrade to file ITR-2 with equity & MF gains.",
    icon: Lock,
    color: "#D97706",
    bg: "#FFFBEB",
    border: "#FDE68A",
  },
  {
    type: "timeout",
    title: "IT Portal — OTP",
    url: "eportal.incometax.gov.in",
    body: "OTP has expired. Please re-generate and try again.",
    sub: "You have 2 attempts remaining before account lock.",
    icon: Clock,
    color: "#7C3AED",
    bg: "#F5F3FF",
    border: "#DDD6FE",
  },
  {
    type: "warning",
    title: "AIS Mismatch Warning",
    url: "compliance.incometax.gov.in",
    body: "Discrepancy detected between Form 26AS and AIS data.",
    sub: "Filed income ₹8,40,000 vs reported ₹9,12,800. Rectify before July 31.",
    icon: AlertTriangle,
    color: "#B45309",
    bg: "#FFFBEB",
    border: "#FCD34D",
  },
];

const testimonials = [
  {
    quote: "I was terrified of ITR. Taxzy made it feel like texting a friend. Done in 12 minutes.",
    name: "Priya M.",
    role: "Salaried, Bengaluru",
    initials: "PM",
    color: "#3D5A80",
  },
  {
    quote: "Got ₹31,000 back that my CA missed for 3 years straight. I'm never going back.",
    name: "Rohan K.",
    role: "Freelance designer, Mumbai",
    initials: "RK",
    color: "#A86545",
  },
  {
    quote: "Finally understood what 80C actually means. The tooltips are genuinely helpful.",
    name: "Ananya S.",
    role: "First-time filer, Pune",
    initials: "AS",
    color: "#16A34A",
  },
  {
    quote: "Filed in 9 minutes. My CA took 3 days and still got the regime wrong.",
    name: "Vikram T.",
    role: "Software engineer, Hyderabad",
    initials: "VT",
    color: "#7C3AED",
  },
  {
    quote: "The refund marketplace feature is genius. Converted to Amazon credits and got 12% extra.",
    name: "Divya R.",
    role: "Marketing manager, Delhi",
    initials: "DR",
    color: "#DC2626",
  },
];

export default function Testimonials() {
  const trackRef = useRef<HTMLDivElement>(null);

  return (
    <section className="py-24 px-6 overflow-hidden" style={{ background: "#FAF9F6" }}>
      <div className="max-w-5xl mx-auto">
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
            Why people switched
          </p>
          <h2
            className="text-3xl md:text-4xl font-extrabold tracking-tight"
            style={{ color: "#1C1F23" }}
          >
            The old way is{" "}
            <span style={{ color: "#DC2626" }}>painful.</span>
          </h2>
          <p className="text-sm mt-3 max-w-md mx-auto" style={{ color: "#6B7280" }}>
            Real errors from the IT portal and other tools — before people found Taxzy.
          </p>
        </motion.div>

        {/* Frustration screenshot mockups */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-14">
          {frustrations.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.32, ease: "easeOut", delay: i * 0.07 }}
                className="rounded-xl overflow-hidden"
                style={{
                  border: `1px solid ${item.border}`,
                  background: "#fff",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
                }}
              >
                {/* Browser chrome */}
                <div
                  className="flex items-center gap-1.5 px-3 py-2 border-b"
                  style={{ background: "#F9FAFB", borderColor: "#E5E7EB" }}
                >
                  {["#FC605B", "#FDBC40", "#34C84A"].map((c) => (
                    <div key={c} className="w-2 h-2 rounded-full" style={{ background: c }} />
                  ))}
                  <div
                    className="flex-1 mx-2 rounded text-[9px] px-2 py-0.5 text-center truncate"
                    style={{ background: "#E5E7EB", color: "#9CA3AF" }}
                  >
                    {item.url}
                  </div>
                </div>

                {/* Error body */}
                <div className="p-4" style={{ background: item.bg }}>
                  <div className="flex items-start gap-2.5 mb-2.5">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ background: `${item.color}18` }}
                    >
                      <Icon size={14} style={{ color: item.color }} />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold leading-tight mb-0.5" style={{ color: item.color }}>
                        {item.title}
                      </p>
                      <p className="text-[10px] font-medium leading-snug" style={{ color: "#374151" }}>
                        {item.body}
                      </p>
                    </div>
                  </div>
                  <p className="text-[9px] leading-relaxed" style={{ color: "#9CA3AF" }}>
                    {item.sub}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Divider with label */}
        <div className="flex items-center gap-4 mb-12">
          <div className="flex-1 h-px" style={{ background: "rgba(216,214,209,0.7)" }} />
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#9CA3AF" }}>
            After switching to Taxzy
          </p>
          <div className="flex-1 h-px" style={{ background: "rgba(216,214,209,0.7)" }} />
        </div>

        {/* Testimonial carousel */}
        <div
          className="relative"
          style={{
            maskImage:
              "linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%)",
          }}
        >
          <div
            ref={trackRef}
            className="flex gap-4 overflow-x-auto pb-4"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none", cursor: "grab" }}
            onMouseDown={(e) => {
              const el = trackRef.current!;
              const startX = e.pageX - el.offsetLeft;
              const startScroll = el.scrollLeft;
              const onMove = (ev: MouseEvent) => {
                el.scrollLeft = startScroll - (ev.pageX - el.offsetLeft - startX);
              };
              const onUp = () => {
                document.removeEventListener("mousemove", onMove);
                document.removeEventListener("mouseup", onUp);
                el.style.cursor = "grab";
              };
              el.style.cursor = "grabbing";
              document.addEventListener("mousemove", onMove);
              document.addEventListener("mouseup", onUp);
            }}
          >
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.32, ease: "easeOut", delay: i * 0.07 }}
                className="flex-shrink-0 rounded-2xl p-6 flex flex-col"
                style={{
                  width: 280,
                  background: "#fff",
                  border: "1px solid rgba(216,214,209,0.7)",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
                }}
              >
                <div className="flex gap-0.5 mb-4">
                  {[...Array(5)].map((_, si) => (
                    <Star key={si} size={13} className="fill-[#F59E0B] text-[#F59E0B]" />
                  ))}
                </div>
                <p className="text-sm leading-relaxed italic flex-1 mb-5" style={{ color: "#374151" }}>
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                    style={{ background: t.color }}
                  >
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-xs font-semibold" style={{ color: "#1C1F23" }}>{t.name}</p>
                    <p className="text-[10px]" style={{ color: "#9CA3AF" }}>{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
