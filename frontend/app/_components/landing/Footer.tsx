"use client";
import Link from "next/link";

const links = {
  Product: ["Features", "How it works", "Pricing", "Security"],
  Company: ["About", "Blog", "Careers", "Contact"],
  Legal: ["Privacy", "Terms", "Grievance", "Cookie policy"],
};

export default function Footer() {
  return (
    <footer
      className="border-t px-6 pt-14 pb-8"
      style={{ background: "#F3F2EF", borderColor: "rgba(216,214,209,0.8)" }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div
                className="w-7 h-7 rounded-[7px] flex items-center justify-center"
                style={{ background: "#3D5A80" }}
              >
                <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4">
                  <path d="M3 4h10M3 8h7M3 12h5" stroke="white" strokeWidth="1.7" strokeLinecap="round" />
                </svg>
              </div>
              <span
                className="font-extrabold text-lg tracking-tight"
                style={{ color: "#3D5A80" }}
              >
                T<span style={{ color: "#1C1F23" }}>a</span>x<span style={{ color: "#1C1F23" }}>z</span>y
              </span>
            </Link>
            <p className="text-xs leading-relaxed mb-4" style={{ color: "#6B7280" }}>
              AI-powered income tax filing for India. Built for salaried professionals, freelancers, and everyone in between.
            </p>
            <p className="text-xs font-medium" style={{ color: "#9CA3AF" }}>
              India &nbsp;·&nbsp; AY 2025-26
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(links).map(([section, items]) => (
            <div key={section}>
              <p
                className="text-[10px] font-semibold uppercase tracking-[0.1em] mb-4"
                style={{ color: "#9CA3AF" }}
              >
                {section}
              </p>
              <ul className="space-y-2.5">
                {items.map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-xs transition-colors duration-150"
                      style={{ color: "#6B7280" }}
                      onMouseEnter={(e) => ((e.target as HTMLElement).style.color = "#1C1F23")}
                      onMouseLeave={(e) => ((e.target as HTMLElement).style.color = "#6B7280")}
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6"
          style={{ borderTop: "1px solid rgba(216,214,209,0.8)" }}
        >
          <p className="text-[11px]" style={{ color: "#9CA3AF" }}>
            © 2025 Taxzy Technologies Pvt. Ltd. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {["Privacy", "Terms", "Grievance"].map((item) => (
              <a
                key={item}
                href="#"
                className="text-[11px] transition-colors duration-150"
                style={{ color: "#9CA3AF" }}
                onMouseEnter={(e) => ((e.target as HTMLElement).style.color = "#1C1F23")}
                onMouseLeave={(e) => ((e.target as HTMLElement).style.color = "#9CA3AF")}
              >
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
