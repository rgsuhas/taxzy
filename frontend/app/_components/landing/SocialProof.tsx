"use client";
import { Building2, Landmark, CreditCard, Shield, Link2, TrendingUp } from "lucide-react";

const logos = [
  { name: "HDFC Bank",           Icon: Building2 },
  { name: "State Bank of India", Icon: Landmark },
  { name: "Razorpay",            Icon: CreditCard },
  { name: "ICICI Bank",          Icon: Building2 },
  { name: "IT Dept. Compatible", Icon: Shield },
  { name: "ClearTax Integrated", Icon: Link2 },
  { name: "Zerodha Kite",        Icon: TrendingUp },
  { name: "Axis Bank",           Icon: Landmark },
  { name: "Kotak Mahindra",      Icon: Building2 },
];

export default function SocialProof() {
  return (
    <section
      className="py-10 border-y overflow-hidden"
      style={{ borderColor: "rgba(216,214,209,0.7)", background: "#fff" }}
    >
      <p
        className="text-center text-[10px] font-semibold uppercase tracking-[0.12em] mb-6"
        style={{ color: "#9CA3AF" }}
      >
        Works with your existing accounts
      </p>

      <div
        className="relative"
        style={{
          maskImage:
            "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
        }}
      >
        <div
          className="flex gap-3"
          style={{
            width: "max-content",
            animation: "marquee 40s linear infinite",
          }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLElement).style.animationPlayState = "paused")
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLElement).style.animationPlayState = "running")
          }
        >
          {[...logos, ...logos].map((logo, i) => (
            <div
              key={i}
              className="flex items-center gap-2.5 px-5 py-3 rounded-xl flex-shrink-0"
              style={{
                border: "1px solid rgba(216,214,209,0.7)",
                background: "#FAFAF9",
              }}
            >
              <logo.Icon
                size={15}
                style={{ color: "#3D5A80", flexShrink: 0 }}
              />
              <span
                className="text-xs font-medium whitespace-nowrap"
                style={{ color: "#6B7280" }}
              >
                {logo.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
