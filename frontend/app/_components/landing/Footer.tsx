"use client";
import Link from "next/link";

const links = {
  Product: ["Features", "How it works", "Pricing", "Security"],
  Company: ["About", "Blog", "Careers", "Contact"],
  Legal: ["Privacy", "Terms", "Grievance", "Cookie policy"],
  "Open Source": ["GitHub", "Self-host docs", "Contributing", "License"],
};

const linkHrefs: Record<string, Record<string, string>> = {
  "Open Source": {
    GitHub: "https://github.com/rgsuhas/super-tax",
    "Self-host docs": "https://github.com/rgsuhas/super-tax/blob/main/docs/self-hosting.md",
    Contributing: "https://github.com/rgsuhas/super-tax/blob/main/docs/CONTRIBUTING.md",
    License: "https://github.com/rgsuhas/super-tax/blob/main/LICENSE",
  },
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
                {items.map((item) => {
                  const href = linkHrefs[section]?.[item] ?? "#";
                  const isExternal = href.startsWith("http");
                  return (
                    <li key={item}>
                      <a
                        href={href}
                        {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                        className="text-xs transition-colors duration-150"
                        style={{ color: "#6B7280" }}
                        onMouseEnter={(e) => ((e.target as HTMLElement).style.color = "#1C1F23")}
                        onMouseLeave={(e) => ((e.target as HTMLElement).style.color = "#6B7280")}
                      >
                        {item}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6"
          style={{ borderTop: "1px solid rgba(216,214,209,0.8)" }}
        >
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-[11px]" style={{ color: "#9CA3AF" }}>
              © 2025 Taxzy Technologies Pvt. Ltd.
            </p>
            <a
              href="https://github.com/rgsuhas/super-tax/blob/main/LICENSE"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md transition-colors duration-150"
              style={{
                color: "#3D5A80",
                background: "rgba(61,90,128,0.08)",
                border: "1px solid rgba(61,90,128,0.16)",
              }}
            >
              <svg viewBox="0 0 16 16" width="10" height="10" fill="currentColor">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
              </svg>
              GPL-2.0 Open Source
            </a>
          </div>
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
