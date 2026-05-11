"use client";

const logos = [
  { name: "HDFC Bank",             emoji: "🏦" },
  { name: "State Bank of India",   emoji: "🏛️" },
  { name: "Razorpay",              emoji: "💳" },
  { name: "ICICI Bank",            emoji: "🏦" },
  { name: "IT Dept. Compatible",   emoji: "🇮🇳" },
  { name: "ClearTax Integrated",   emoji: "🔗" },
  { name: "Zerodha Kite",          emoji: "📈" },
  { name: "Axis Bank",             emoji: "🏛️" },
  { name: "Kotak Mahindra",        emoji: "🏦" },
];

export default function SocialProof() {
  return (
    <section
      className="py-5 border-y overflow-hidden"
      style={{ borderColor: "rgba(216,214,209,0.7)", background: "#fff" }}
    >
      <p
        className="text-center text-[10px] font-semibold uppercase tracking-[0.12em] mb-4"
        style={{ color: "#9CA3AF" }}
      >
        Works with your existing accounts
      </p>

      <div className="relative" style={{ maskImage: "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)" }}>
        <div
          className="flex gap-4"
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
              className="flex items-center gap-2 px-4 py-2 rounded-xl flex-shrink-0"
              style={{
                border: "1px solid rgba(216,214,209,0.7)",
                background: "#FAFAF9",
              }}
            >
              <span className="text-base leading-none">{logo.emoji}</span>
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
