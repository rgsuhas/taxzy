"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, MessageSquare, BarChart2, ShoppingBag, BookOpen, CheckCircle, X } from "lucide-react";
import type { Transition } from "framer-motion";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 8 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.25, ease: "easeOut" as Transition["ease"], delay },
});

const features = [
  {
    icon: MessageSquare,
    title: "AI tax assistant",
    desc: "Chat in plain English. Taxzy asks the right questions and fills your profile automatically from your answers.",
  },
  {
    icon: BarChart2,
    title: "Instant dashboard",
    desc: "See your refund, tax liability, deductions, and regime comparison the moment your document is uploaded.",
  },
  {
    icon: ShoppingBag,
    title: "Refund marketplace",
    desc: "Get up to 15% more value on your refund by converting it to Amazon, Swiggy, Flipkart, or Zomato credits.",
  },
  {
    icon: BookOpen,
    title: "Jargon simplifier",
    desc: "Every term like TDS, HRA, or 80C is automatically underlined with a plain-English tooltip on hover.",
  },
];

const comparison = [
  { feature: "Conversational filing", taxzy: true, cleartax: false },
  { feature: "Refund marketplace", taxzy: true, cleartax: false },
  { feature: "Jargon tooltips", taxzy: true, cleartax: false },
  { feature: "Tax usage visualization", taxzy: true, cleartax: false },
  { feature: "AIS auto-import", taxzy: true, cleartax: true },
  { feature: "ITR XML export", taxzy: true, cleartax: true },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--taxzy-bg)] font-sans">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <span className="font-extrabold text-xl text-[var(--taxzy-slate)] tracking-tight">Taxzy</span>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm text-[var(--taxzy-stone)] hover:text-[var(--foreground)] transition-colors">
            Sign in
          </Link>
          <Link
            href="/register"
            className="bg-[var(--taxzy-slate)] text-white text-sm px-4 py-2 rounded-lg font-medium hover:bg-[var(--taxzy-slate-dark)] transition-colors"
          >
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-24 text-center">
        <motion.h1
          {...fadeUp(0)}
          className="text-5xl md:text-6xl font-extrabold text-[var(--taxzy-ink)] tracking-[-0.035em] leading-tight mb-4"
        >
          File taxes.<br />Fear nothing.
        </motion.h1>
        <motion.p {...fadeUp(0.05)} className="text-lg text-[var(--taxzy-stone)] max-w-xl mx-auto mb-8">
          Taxzy is an AI-powered tax assistant built for India. Chat your way through filing, upload your Form 16, and get your refund — in minutes.
        </motion.p>
        <motion.div {...fadeUp(0.1)}>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-[var(--taxzy-slate)] text-white px-6 py-3 rounded-xl font-semibold text-base hover:bg-[var(--taxzy-slate-dark)] transition-colors shadow-sm"
          >
            File my taxes — it&apos;s free
            <ArrowRight size={18} />
          </Link>
        </motion.div>
      </section>

      {/* Problem / Solution */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <div className="grid md:grid-cols-2 gap-6">
          <motion.div {...fadeUp(0)} className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-[var(--taxzy-stone)] mb-3">The problem</p>
            <p className="text-lg font-bold text-[var(--taxzy-ink)] mb-2">Tax filing is confusing, jargon-heavy, and anxiety-inducing</p>
            <p className="text-sm text-[var(--taxzy-stone)]">
              Between Form 16, AIS, TDS, 80C, HRA, and choosing the right regime — most people just give up or pay a CA ₹5,000 for something they could do themselves.
            </p>
          </motion.div>
          <motion.div {...fadeUp(0.05)} className="bg-[var(--taxzy-slate)] rounded-2xl p-6 text-white">
            <p className="text-xs font-semibold uppercase tracking-widest opacity-60 mb-3">The solution</p>
            <p className="text-lg font-bold mb-2">Just talk to Taxzy</p>
            <p className="text-sm opacity-80">
              Ask questions in plain English. Upload a PDF. Taxzy extracts your data, picks the best regime, and files — while explaining every term along the way.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <motion.p {...fadeUp()} className="text-xs font-semibold uppercase tracking-widest text-[var(--taxzy-stone)] mb-6 text-center">
          Everything you need
        </motion.p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div key={f.title} {...fadeUp(i * 0.05)} className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
                <Icon size={20} className="text-[var(--taxzy-slate)] mb-3" />
                <p className="font-semibold text-[var(--foreground)] mb-1">{f.title}</p>
                <p className="text-xs text-[var(--taxzy-stone)] leading-relaxed">{f.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Comparison table */}
      <section className="max-w-2xl mx-auto px-6 pb-20">
        <motion.p {...fadeUp()} className="text-xs font-semibold uppercase tracking-widest text-[var(--taxzy-stone)] mb-6 text-center">
          Taxzy vs ClearTax
        </motion.p>
        <motion.div {...fadeUp(0.05)} className="bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden">
          <div className="grid grid-cols-3 text-xs font-semibold uppercase tracking-wide text-[var(--taxzy-stone)] px-5 py-3 border-b border-[var(--border)]">
            <span>Feature</span>
            <span className="text-center text-[var(--taxzy-slate)]">Taxzy</span>
            <span className="text-center">ClearTax</span>
          </div>
          {comparison.map((row) => (
            <div key={row.feature} className="grid grid-cols-3 px-5 py-3 border-b border-[var(--border)] last:border-0 text-sm">
              <span className="text-[var(--foreground)]">{row.feature}</span>
              <span className="flex justify-center">
                {row.taxzy ? <CheckCircle size={16} className="text-[var(--taxzy-success)]" /> : <X size={16} className="text-[var(--taxzy-stone)]" />}
              </span>
              <span className="flex justify-center">
                {row.cleartax ? <CheckCircle size={16} className="text-[var(--taxzy-stone)]" /> : <X size={16} className="text-[var(--taxzy-stone)]" />}
              </span>
            </div>
          ))}
        </motion.div>
      </section>

      {/* CTA */}
      <section className="max-w-xl mx-auto px-6 pb-24 text-center">
        <motion.div {...fadeUp()}>
          <p className="text-2xl font-bold text-[var(--taxzy-ink)] mb-3">Ready to file?</p>
          <p className="text-sm text-[var(--taxzy-stone)] mb-6">Takes under 5 minutes. No CA needed. Always free.</p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-[var(--taxzy-slate)] text-white px-6 py-3 rounded-xl font-semibold text-base hover:bg-[var(--taxzy-slate-dark)] transition-colors"
          >
            File my taxes — it&apos;s free
            <ArrowRight size={18} />
          </Link>
        </motion.div>
      </section>

      <footer className="border-t border-[var(--border)] px-6 py-6 text-center">
        <p className="text-xs text-[var(--taxzy-stone)]">Taxzy &copy; 2024 — Built for India</p>
      </footer>
    </div>
  );
}
