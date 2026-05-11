"use client";
import { useRef } from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";

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
            Testimonials
          </p>
          <h2
            className="text-3xl md:text-4xl font-extrabold tracking-tight"
            style={{ color: "#1C1F23" }}
          >
            From first-time filers{" "}
            <span style={{ color: "#3D5A80" }}>to freelancers.</span>
          </h2>
        </motion.div>

        {/* Carousel track */}
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
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              cursor: "grab",
            }}
            onMouseDown={(e) => {
              const el = trackRef.current!;
              let startX = e.pageX - el.offsetLeft;
              let startScroll = el.scrollLeft;
              const onMove = (ev: MouseEvent) => {
                const x = ev.pageX - el.offsetLeft;
                el.scrollLeft = startScroll - (x - startX);
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
                {/* Stars */}
                <div className="flex gap-0.5 mb-4">
                  {[...Array(5)].map((_, si) => (
                    <Star
                      key={si}
                      size={13}
                      className="fill-[#F59E0B] text-[#F59E0B]"
                    />
                  ))}
                </div>

                {/* Quote */}
                <p
                  className="text-sm leading-relaxed italic flex-1 mb-5"
                  style={{ color: "#374151" }}
                >
                  &ldquo;{t.quote}&rdquo;
                </p>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                    style={{ background: t.color }}
                  >
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-xs font-semibold" style={{ color: "#1C1F23" }}>
                      {t.name}
                    </p>
                    <p className="text-[10px]" style={{ color: "#9CA3AF" }}>
                      {t.role}
                    </p>
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
