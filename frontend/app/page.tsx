"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  MessageSquare,
  FileCheck,
  IndianRupee,
  ShoppingBag,
  CheckCircle,
  X,
  Zap,
  Shield,
  Clock,
  ChevronRight,
} from "lucide-react";
import type { Transition } from "framer-motion";

const ease = "easeOut" as Transition["ease"];

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 12 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.3, ease, delay },
});

const steps = [
  {
    n: "01",
    icon: MessageSquare,
    title: "Just chat",
    body: "Tell Taxzy your salary, TDS, and investments — in plain English or Hinglish. No forms. No jargon. Just a conversation.",
  },
  {
    n: "02",
    icon: FileCheck,
    title: "We handle the math",
    body: "Taxzy reads your Form 16 or AIS, picks the better tax regime, finds every deduction, and shows your exact refund amount.",
  },
  {
    n: "03",
    icon: IndianRupee,
    title: "Get your refund",
    body: "Download your ITR XML, file it on the portal in two clicks — or redeem your refund for up to 15% more value on Amazon, Swiggy, and more.",
  },
];

const painPoints = [
  {
    before: "Paid ₹2,500 to a CA for 15 minutes of work",
    after: "Taxzy is free. Always.",
  },
  {
    before: "Googled \"old regime vs new regime\" for 45 minutes",
    after: "Taxzy compares both and picks the one that saves you more",
  },
  {
    before: "Panicked at \"Section 80C\" on your Form 16",
    after: "Every term is explained on hover, in plain English",
  },
  {
    before: "Filed in July, stressed the entire month before",
    after: "Chat in June. Done in 5 minutes. Forget about it.",
  },
];

const features = [
  {
    icon: MessageSquare,
    label: "Conversational filing",
    title: "Tax filing that feels like texting a friend",
    body: "Taxzy asks one question at a time. You answer in plain language. It builds your return in the background — no form-filling, no switching tabs.",
  },
  {
    icon: Shield,
    label: "Regime optimizer",
    title: "Old regime or new — Taxzy always picks the winner",
    body: "Most people overpay by ₹15,000–40,000 by choosing the wrong regime. Taxzy calculates both instantly and shows you the difference in rupees.",
  },
  {
    icon: ShoppingBag,
    label: "Refund marketplace",
    title: "Turn your ₹28,000 refund into ₹32,200",
    body: "Redeem your tax refund for Amazon Pay, Swiggy Money, or Flipkart credits and get up to 15% more. Instant delivery, zero wait.",
  },
  {
    icon: Zap,
    label: "Jargon translator",
    title: "Every confusing term — explained on hover",
    body: "TDS. HRA. 26AS. 80CCD(1B). Hover any term in Taxzy's replies and get a plain-English definition with a real example. No more Google.",
  },
];

const comparison = [
  { feature: "Conversational chat filing", taxzy: true, cleartax: false, taxbuddy: false },
  { feature: "Refund marketplace (+15%)", taxzy: true, cleartax: false, taxbuddy: false },
  { feature: "Jargon tooltips in-chat", taxzy: true, cleartax: false, taxbuddy: false },
  { feature: "Tax usage visualization", taxzy: true, cleartax: false, taxbuddy: false },
  { feature: "Regime auto-optimizer", taxzy: true, cleartax: true, taxbuddy: true },
  { feature: "AIS / Form 16 import", taxzy: true, cleartax: true, taxbuddy: true },
  { feature: "ITR XML export", taxzy: true, cleartax: true, taxbuddy: true },
  { feature: "Free for salaried (ITR-1)", taxzy: true, cleartax: true, taxbuddy: false },
];

const stats = [
  { value: "₹0", label: "CA fees. Forever." },
  { value: "5 min", label: "Average filing time" },
  { value: "+15%", label: "More on your refund" },
  { value: "ITR-1", label: "Salaried? You're covered." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--taxzy-bg)] font-sans">

      {/* Announcement bar */}
      <div className="bg-[var(--taxzy-slate)] text-white text-xs text-center py-2 px-4 font-medium tracking-wide">
        ITR filing season is open — July 31 deadline.{" "}
        <Link href="/register" className="underline underline-offset-2 opacity-80 hover:opacity-100">
          Start filing free
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <span className="font-extrabold text-xl text-[var(--taxzy-slate)] tracking-tight">Taxzy</span>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm text-[var(--taxzy-stone)] hover:text-[var(--foreground)] transition-colors hidden sm:block">
            Sign in
          </Link>
          <Link
            href="/register"
            className="bg-[var(--taxzy-slate)] text-white text-sm px-4 py-2 rounded-lg font-semibold hover:bg-[var(--taxzy-slate-dark)] transition-colors"
          >
            File free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-16 pb-20 text-center">
        <motion.div {...fadeUp(0)} className="inline-flex items-center gap-2 bg-[var(--taxzy-slate)]/10 text-[var(--taxzy-slate)] text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
          <Zap size={12} />
          AI-powered · Built for salaried India
        </motion.div>

        <motion.h1
          {...fadeUp(0.05)}
          className="text-5xl md:text-6xl font-extrabold text-[var(--taxzy-ink)] tracking-[-0.035em] leading-[1.08] mb-4"
        >
          Your CA charges ₹2,500.<br />
          <span className="text-[var(--taxzy-slate)]">Taxzy charges ₹0.</span>
        </motion.h1>

        <motion.p {...fadeUp(0.1)} className="text-lg text-[var(--taxzy-stone)] max-w-lg mx-auto mb-3 leading-relaxed">
          File your ITR in 5 minutes — just chat. Taxzy reads your Form 16, picks your best regime, and finds every rupee you&apos;re owed.
        </motion.p>

        <motion.p {...fadeUp(0.12)} className="text-sm text-[var(--taxzy-stone)] mb-8">
          No jargon. No CA. No July 31 panic.
        </motion.p>

        <motion.div {...fadeUp(0.15)} className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/register"
            className="inline-flex items-center justify-center gap-2 bg-[var(--taxzy-slate)] text-white px-6 py-3 rounded-xl font-semibold text-base hover:bg-[var(--taxzy-slate-dark)] transition-colors shadow-sm"
          >
            Start filing — it&apos;s free
            <ArrowRight size={17} />
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 bg-[var(--card)] border border-[var(--border)] text-[var(--foreground)] px-6 py-3 rounded-xl font-semibold text-base hover:bg-[var(--muted)] transition-colors"
          >
            Sign in
          </Link>
        </motion.div>

        <motion.p {...fadeUp(0.2)} className="text-xs text-[var(--taxzy-stone)] mt-4">
          Free forever for salaried individuals (ITR-1) · No credit card
        </motion.p>
      </section>

      {/* Stats bar */}
      <section className="border-y border-[var(--border)] bg-[var(--card)]">
        <div className="max-w-4xl mx-auto px-6 py-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((s, i) => (
            <motion.div key={s.label} {...fadeUp(i * 0.05)} className="text-center">
              <p className="money text-2xl font-bold text-[var(--taxzy-slate)]">{s.value}</p>
              <p className="text-xs text-[var(--taxzy-stone)] mt-1">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Pain → Gain */}
      <section className="max-w-3xl mx-auto px-6 py-20">
        <motion.div {...fadeUp()} className="text-center mb-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--taxzy-stone)] mb-2">Sound familiar?</p>
          <h2 className="text-2xl md:text-3xl font-bold text-[var(--taxzy-ink)] tracking-tight">
            Filing taxes shouldn&apos;t feel like this
          </h2>
        </motion.div>
        <div className="space-y-3">
          {painPoints.map((p, i) => (
            <motion.div key={i} {...fadeUp(i * 0.07)} className="grid md:grid-cols-2 gap-0 rounded-xl overflow-hidden border border-[var(--border)]">
              <div className="flex items-start gap-3 px-5 py-4 bg-[var(--card)]">
                <X size={15} className="text-[var(--taxzy-stone)] mt-0.5 shrink-0" />
                <p className="text-sm text-[var(--taxzy-stone)]">{p.before}</p>
              </div>
              <div className="flex items-start gap-3 px-5 py-4 bg-[var(--taxzy-slate)]/5 border-t md:border-t-0 md:border-l border-[var(--border)]">
                <CheckCircle size={15} className="text-[var(--taxzy-success)] mt-0.5 shrink-0" />
                <p className="text-sm font-medium text-[var(--foreground)]">{p.after}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-[var(--taxzy-slate)] text-white py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div {...fadeUp()} className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest opacity-50 mb-2">How Taxzy works</p>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Three steps. Five minutes. Done.</h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.div key={s.n} {...fadeUp(i * 0.1)} className="relative">
                  {i < steps.length - 1 && (
                    <ChevronRight size={18} className="hidden md:block absolute -right-5 top-5 opacity-30" />
                  )}
                  <p className="text-4xl font-extrabold opacity-15 mb-3 tracking-tight">{s.n}</p>
                  <Icon size={22} className="mb-3 opacity-80" />
                  <p className="font-semibold text-base mb-2">{s.title}</p>
                  <p className="text-sm opacity-70 leading-relaxed">{s.body}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <motion.div {...fadeUp()} className="text-center mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--taxzy-stone)] mb-2">Built differently</p>
          <h2 className="text-2xl md:text-3xl font-bold text-[var(--taxzy-ink)] tracking-tight">
            Everything ClearTax isn&apos;t
          </h2>
          <p className="text-sm text-[var(--taxzy-stone)] mt-2 max-w-sm mx-auto">
            No dashboard to figure out. No form to fill. Just a conversation that gets you filed.
          </p>
        </motion.div>
        <div className="grid md:grid-cols-2 gap-5">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div key={f.label} {...fadeUp(i * 0.07)} className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-[var(--taxzy-slate)]/10 flex items-center justify-center">
                    <Icon size={16} className="text-[var(--taxzy-slate)]" />
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-widest text-[var(--taxzy-stone)]">{f.label}</span>
                </div>
                <p className="font-bold text-[var(--taxzy-ink)] mb-2 leading-snug">{f.title}</p>
                <p className="text-sm text-[var(--taxzy-stone)] leading-relaxed">{f.body}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Comparison */}
      <section className="bg-[var(--card)] border-y border-[var(--border)] py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div {...fadeUp()} className="text-center mb-10">
            <p className="text-xs font-semibold uppercase tracking-widest text-[var(--taxzy-stone)] mb-2">Honest comparison</p>
            <h2 className="text-2xl md:text-3xl font-bold text-[var(--taxzy-ink)] tracking-tight">
              Why salaried filers pick Taxzy
            </h2>
          </motion.div>
          <motion.div {...fadeUp(0.05)} className="rounded-2xl overflow-hidden border border-[var(--border)]">
            <div className="grid grid-cols-4 text-xs font-semibold uppercase tracking-wide text-[var(--taxzy-stone)] px-5 py-3 border-b border-[var(--border)] bg-[var(--muted)]">
              <span className="col-span-2">Feature</span>
              <span className="text-center text-[var(--taxzy-slate)]">Taxzy</span>
              <span className="text-center">Others</span>
            </div>
            {comparison.map((row, i) => (
              <div
                key={row.feature}
                className="grid grid-cols-4 px-5 py-3.5 border-b border-[var(--border)] last:border-0 text-sm"
              >
                <span className="col-span-2 text-[var(--foreground)]">{row.feature}</span>
                <span className="flex justify-center">
                  {row.taxzy
                    ? <CheckCircle size={16} className="text-[var(--taxzy-success)]" />
                    : <X size={16} className="text-[var(--taxzy-stone)] opacity-40" />}
                </span>
                <span className="flex justify-center">
                  {(row.cleartax || row.taxbuddy)
                    ? <CheckCircle size={16} className="text-[var(--taxzy-stone)] opacity-50" />
                    : <X size={16} className="text-[var(--taxzy-stone)] opacity-40" />}
                </span>
              </div>
            ))}
          </motion.div>
          <motion.p {...fadeUp(0.1)} className="text-xs text-center text-[var(--taxzy-stone)] mt-4">
            "Others" reflects the best-case across ClearTax, TaxBuddy, and myITreturn as of 2024.
          </motion.p>
        </div>
      </section>

      {/* Testimonial-style trust strip */}
      <section className="max-w-4xl mx-auto px-6 py-20">
        <motion.div {...fadeUp()} className="text-center mb-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--taxzy-stone)] mb-2">Built for one person</p>
          <h2 className="text-2xl md:text-3xl font-bold text-[var(--taxzy-ink)] tracking-tight max-w-xl mx-auto leading-snug">
            If you&apos;re salaried, this is the only tax app you need
          </h2>
        </motion.div>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            {
              icon: Clock,
              title: "Filing in 5 minutes",
              body: "Tell Taxzy your income and investments. It does the rest — automatically reading your Form 16 and AIS from the IT portal.",
            },
            {
              icon: IndianRupee,
              title: "Every rupee found",
              body: "80C, 80D, HRA, standard deduction — Taxzy checks every section and tells you exactly how much you're getting back.",
            },
            {
              icon: Shield,
              title: "No scary surprises",
              body: "Taxzy explains what's happening at each step. No jargon. No anxiety. Just clarity on exactly what you owe — or what the IT department owes you.",
            },
          ].map((card, i) => {
            const Icon = card.icon;
            return (
              <motion.div key={card.title} {...fadeUp(i * 0.07)} className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
                <Icon size={18} className="text-[var(--taxzy-slate)] mb-3" />
                <p className="font-semibold text-[var(--foreground)] mb-2">{card.title}</p>
                <p className="text-sm text-[var(--taxzy-stone)] leading-relaxed">{card.body}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-[var(--taxzy-slate)] text-white py-20 px-6">
        <motion.div {...fadeUp()} className="max-w-xl mx-auto text-center">
          <p className="text-xs font-semibold uppercase tracking-widest opacity-50 mb-4">No credit card. No catch.</p>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-[-0.03em] leading-tight mb-4">
            File your taxes.<br />Keep your ₹2,500.
          </h2>
          <p className="text-base opacity-70 mb-8 leading-relaxed">
            Join thousands of salaried Indians who stopped paying CAs for something Taxzy does in 5 minutes — for free.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-white text-[var(--taxzy-slate)] px-7 py-3.5 rounded-xl font-bold text-base hover:bg-[var(--taxzy-bg)] transition-colors shadow-sm"
          >
            Start filing free
            <ArrowRight size={17} />
          </Link>
          <p className="text-xs opacity-40 mt-4">Free for ITR-1 · Takes 5 minutes · July 31 deadline</p>
        </motion.div>
      </section>

      <footer className="border-t border-[var(--border)] px-6 py-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="font-extrabold text-[var(--taxzy-slate)] tracking-tight">Taxzy</span>
          <p className="text-xs text-[var(--taxzy-stone)]">
            For salaried individuals filing ITR-1 · AY 2024-25 · Built in India
          </p>
          <div className="flex items-center gap-4 text-xs text-[var(--taxzy-stone)]">
            <Link href="/login" className="hover:text-[var(--foreground)] transition-colors">Sign in</Link>
            <Link href="/register" className="hover:text-[var(--foreground)] transition-colors">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
