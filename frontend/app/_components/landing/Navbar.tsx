"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        height: scrolled ? 60 : 80,
        transition: "height 200ms ease-out, box-shadow 200ms ease-out, background 200ms ease-out, border-color 200ms ease-out",
        backdropFilter: scrolled ? "blur(32px) saturate(200%) brightness(1.06)" : "blur(24px) saturate(180%)",
        WebkitBackdropFilter: scrolled ? "blur(32px) saturate(200%) brightness(1.06)" : "blur(24px) saturate(180%)",
        background: scrolled
          ? "linear-gradient(135deg, rgba(255,255,255,0.62) 0%, rgba(243,242,239,0.52) 100%)"
          : "linear-gradient(135deg, rgba(255,255,255,0.45) 0%, rgba(243,242,239,0.35) 100%)",
        borderBottom: scrolled
          ? "1px solid rgba(255,255,255,0.45)"
          : "1px solid rgba(255,255,255,0.2)",
        boxShadow: scrolled
          ? "0 8px 32px rgba(61,90,128,0.1), inset 0 1px 0 rgba(255,255,255,0.7)"
          : "inset 0 1px 0 rgba(255,255,255,0.4)",
      }}
    >
      <div className="max-w-6xl mx-auto px-6 h-full flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
          <div
            className="w-7 h-7 rounded-[7px] flex items-center justify-center flex-shrink-0"
            style={{ background: "#3D5A80" }}
          >
            <svg viewBox="0 0 16 16" fill="none" className="w-[15px] h-[15px]">
              <path d="M3 4h10M3 8h7M3 12h5" stroke="white" strokeWidth="1.7" strokeLinecap="round" />
            </svg>
          </div>
          <span
            className="font-extrabold text-[1.15rem] tracking-tight select-none"
            style={{ color: "#3D5A80" }}
          >
            T<span style={{ color: "#1C1F23" }}>a</span>x<span style={{ color: "#1C1F23" }}>z</span>y
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-7">
          {[
            { label: "Features", href: "#features" },
            { label: "How it works", href: "#how-it-works" },
            { label: "Pricing", href: "#pricing" },
          ].map(({ label, href }) => (
            <a
              key={label}
              href={href}
              className="text-sm font-medium transition-colors duration-150"
              style={{ color: "#6B7280" }}
              onMouseEnter={(e) => ((e.target as HTMLElement).style.color = "#1C1F23")}
              onMouseLeave={(e) => ((e.target as HTMLElement).style.color = "#6B7280")}
            >
              {label}
            </a>
          ))}
          <a
            href="https://github.com/rgsuhas/super-tax"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-medium transition-colors duration-150"
            style={{ color: "#6B7280" }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#1C1F23")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "#6B7280")}
          >
            <svg viewBox="0 0 16 16" width="15" height="15" fill="currentColor" aria-hidden="true">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
            </svg>
            Star on GitHub
          </a>
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-2">
          <Link
            href="/login"
            className="text-sm font-medium px-3 py-1.5 rounded-lg transition-all duration-150"
            style={{ color: "#6B7280" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.color = "#1C1F23";
              (e.currentTarget as HTMLElement).style.background = "rgba(0,0,0,0.05)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.color = "#6B7280";
              (e.currentTarget as HTMLElement).style.background = "transparent";
            }}
          >
            Log in
          </Link>
          <Link
            href="/register"
            className="text-sm font-semibold px-4 py-2 rounded-lg text-white transition-all duration-200"
            style={{
              background: "#3D5A80",
              boxShadow: "0 1px 4px rgba(61,90,128,0.28)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = "#1F3654";
              (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 14px rgba(61,90,128,0.38)";
              (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "#3D5A80";
              (e.currentTarget as HTMLElement).style.boxShadow = "0 1px 4px rgba(61,90,128,0.28)";
              (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
            }}
          >
            File free →
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-2"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span
            className="w-5 h-0.5 rounded-full transition-all duration-200"
            style={{
              background: "#3D5A80",
              transform: menuOpen ? "rotate(45deg) translate(3px, 3px)" : "none",
            }}
          />
          <span
            className="w-5 h-0.5 rounded-full transition-all duration-200"
            style={{
              background: "#3D5A80",
              opacity: menuOpen ? 0 : 1,
            }}
          />
          <span
            className="w-5 h-0.5 rounded-full transition-all duration-200"
            style={{
              background: "#3D5A80",
              transform: menuOpen ? "rotate(-45deg) translate(3px, -3px)" : "none",
            }}
          />
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          className="md:hidden absolute top-full left-0 right-0 py-4 px-6 flex flex-col gap-3"
          style={{
            background: "rgba(255,255,255,0.7)",
            backdropFilter: "blur(32px) saturate(200%)",
            WebkitBackdropFilter: "blur(32px) saturate(200%)",
            borderBottom: "1px solid rgba(255,255,255,0.45)",
            boxShadow: "0 8px 32px rgba(61,90,128,0.1)",
          }}
        >
          {["Features", "How it works", "Pricing"].map((label) => (
            <a
              key={label}
              href={`#${label.toLowerCase().replace(/\s+/g, "-")}`}
              className="text-sm font-medium py-1.5"
              style={{ color: "#1C1F23" }}
              onClick={() => setMenuOpen(false)}
            >
              {label}
            </a>
          ))}
          <div className="flex gap-2 pt-2 border-t" style={{ borderColor: "rgba(216,214,209,0.6)" }}>
            <Link href="/login" className="flex-1 text-center text-sm font-medium py-2 rounded-lg" style={{ color: "#6B7280", border: "1px solid rgba(216,214,209,0.8)" }}>
              Log in
            </Link>
            <Link href="/register" className="flex-1 text-center text-sm font-semibold py-2 rounded-lg text-white" style={{ background: "#3D5A80" }}>
              File free →
            </Link>
          </div>
        </div>
      )}
    </motion.header>
  );
}
