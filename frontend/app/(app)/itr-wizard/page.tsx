"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Briefcase, Code2, Layers, TrendingUp, Building2, Globe,
  CheckCircle2, ArrowRight, RotateCcw, FileText, IndianRupee,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Wizard definition
// ---------------------------------------------------------------------------

type OptionId = string;

interface Option {
  id: OptionId;
  label: string;
  sublabel?: string;
  icon: React.ElementType;
}

interface Step {
  id: string;
  question: string;
  subtext?: string;
  multi?: boolean;       // allow multiple selections
  options: Option[];
  inputFields?: InputField[];  // optional numeric inputs shown after a selection
}

interface InputField {
  key: string;
  label: string;
  placeholder: string;
  optional?: boolean;
}

const STEPS: Step[] = [
  {
    id: "filing_type",
    question: "What best describes your income source?",
    subtext: "This determines your base ITR form.",
    options: [
      { id: "salaried",   label: "Salaried",          sublabel: "Working for an employer",         icon: Briefcase },
      { id: "freelancer", label: "Freelancer",         sublabel: "Self-employed / consultant",      icon: Code2 },
      { id: "both",       label: "Both",               sublabel: "Salary + freelance / business",   icon: Layers },
    ],
  },
  {
    id: "has_capital_gains",
    question: "Did you sell any stocks, mutual funds, or property?",
    subtext: "Capital gains change which form you need.",
    options: [
      { id: "yes", label: "Yes", sublabel: "Sold shares, MFs, or real estate", icon: TrendingUp },
      { id: "no",  label: "No",  sublabel: "No investments sold this year",    icon: CheckCircle2 },
    ],
  },
  {
    id: "has_foreign_income",
    question: "Do you have any foreign income or assets?",
    subtext: "Foreign bank accounts, RSUs from a foreign employer, overseas property, etc.",
    options: [
      { id: "yes", label: "Yes", sublabel: "Foreign income or assets exist",     icon: Globe },
      { id: "no",  label: "No",  sublabel: "All income is India-sourced",        icon: CheckCircle2 },
    ],
  },
  {
    id: "has_business_income",
    question: "Do you have any business or professional income?",
    subtext: "Income from a proprietary firm, practice, or under presumptive scheme.",
    options: [
      { id: "yes", label: "Yes", sublabel: "Running a business or practice", icon: Building2 },
      { id: "no",  label: "No",  sublabel: "No business income",             icon: CheckCircle2 },
    ],
  },
  {
    id: "income_details",
    question: "Optional: enter income details for a tax estimate",
    subtext: "Skip any fields you don't know yet. We'll compare old vs new regime for you.",
    options: [],
    inputFields: [
      { key: "gross_income",    label: "Gross annual income (₹)",           placeholder: "e.g. 1200000" },
      { key: "tds_paid",        label: "TDS already deducted (₹)",          placeholder: "e.g. 18000",   optional: true },
      { key: "deductions_80c",  label: "80C investments (₹, max 1.5L)",     placeholder: "e.g. 150000",  optional: true },
      { key: "deductions_80d",  label: "80D health insurance premium (₹)",  placeholder: "e.g. 25000",   optional: true },
      { key: "hra",             label: "HRA exemption (₹)",                 placeholder: "e.g. 96000",   optional: true },
    ],
  },
];

// ---------------------------------------------------------------------------
// Result helper
// ---------------------------------------------------------------------------

interface RecommendResult {
  recommended_form: string;
  reason: string;
  regime_comparison?: {
    recommended: string;
    old: { tax_liability: number; refund_or_payable: number };
    new: { tax_liability: number; refund_or_payable: number };
    saving: number;
  };
}

async function fetchRecommendation(answers: Record<string, string>, inputs: Record<string, string>): Promise<RecommendResult> {
  const body = {
    filing_type:         answers.filing_type || "salaried",
    has_capital_gains:   answers.has_capital_gains === "yes",
    has_business_income: answers.has_business_income === "yes",
    has_foreign_income:  answers.has_foreign_income === "yes",
    gross_income:        inputs.gross_income    ? parseFloat(inputs.gross_income)    : null,
    tds_paid:            inputs.tds_paid        ? parseFloat(inputs.tds_paid)        : null,
    deductions_80c:      inputs.deductions_80c  ? parseFloat(inputs.deductions_80c)  : null,
    deductions_80d:      inputs.deductions_80d  ? parseFloat(inputs.deductions_80d)  : null,
    hra:                 inputs.hra             ? parseFloat(inputs.hra)             : null,
  };
  const res = await fetch("/api/itr/recommend", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Failed to get recommendation");
  return res.json();
}

function fmtInr(n: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function OptionTile({
  option, selected, onClick,
}: { option: Option; selected: boolean; onClick: () => void }) {
  const Icon = option.icon;
  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={cn(
        "w-full text-left rounded-2xl px-5 py-4 border transition-all duration-150 cursor-pointer",
        selected
          ? "border-[var(--primary)] bg-[color-mix(in_srgb,var(--primary)_8%,transparent)] shadow-sm"
          : "border-[var(--border)] bg-[var(--card)] hover:border-[color-mix(in_srgb,var(--primary)_40%,transparent)]"
      )}
    >
      <div className="flex items-center gap-4">
        <div className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors",
          selected ? "bg-[var(--primary)] text-white" : "bg-[var(--muted)] text-[var(--muted-foreground)]"
        )}>
          <Icon size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <p className={cn("text-sm font-semibold", selected ? "text-[var(--primary)]" : "text-[var(--foreground)]")}>
            {option.label}
          </p>
          {option.sublabel && (
            <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{option.sublabel}</p>
          )}
        </div>
        <div className={cn(
          "w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-all",
          selected ? "border-[var(--primary)] bg-[var(--primary)]" : "border-[var(--border)]"
        )}>
          {selected && <div className="w-2 h-2 rounded-full bg-white" />}
        </div>
      </div>
    </motion.button>
  );
}

function ResultCard({ result }: { result: RecommendResult }) {
  const router = useRouter();
  const rc = result.regime_comparison;
  const formColors: Record<string, { bg: string; text: string; badge: string }> = {
    "ITR-1": { bg: "bg-emerald-50 dark:bg-emerald-950/30", text: "text-emerald-700 dark:text-emerald-400", badge: "bg-emerald-100 text-emerald-700" },
    "ITR-2": { bg: "bg-blue-50 dark:bg-blue-950/30",       text: "text-blue-700 dark:text-blue-400",       badge: "bg-blue-100 text-blue-700" },
    "ITR-4": { bg: "bg-violet-50 dark:bg-violet-950/30",   text: "text-violet-700 dark:text-violet-400",   badge: "bg-violet-100 text-violet-700" },
  };
  const colors = formColors[result.recommended_form] ?? formColors["ITR-1"];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="space-y-4"
    >
      {/* Form recommendation */}
      <div className={cn("rounded-2xl p-6 border border-transparent", colors.bg)}>
        <div className="flex items-start gap-4">
          <div className={cn("rounded-xl p-3 shrink-0", colors.badge.split(" ")[0])}>
            <FileText size={22} className={colors.text} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] mb-1">
              Recommended form
            </p>
            <p className={cn("text-3xl font-extrabold tracking-tight", colors.text)}>
              {result.recommended_form}
            </p>
            <p className="text-sm text-[var(--muted-foreground)] mt-1 leading-relaxed">
              {result.reason}
            </p>
          </div>
        </div>
      </div>

      {/* Regime comparison */}
      {rc && (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
          <div className="flex items-center gap-2 mb-4">
            <IndianRupee size={16} className="text-[var(--primary)]" />
            <p className="text-sm font-semibold text-[var(--foreground)]">Tax regime comparison</p>
            <span className="ml-auto text-xs font-semibold px-2 py-0.5 rounded-full bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] text-[var(--primary)]">
              {rc.recommended === "new" ? "New" : "Old"} regime recommended
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {(["old", "new"] as const).map((r) => {
              const isRec = rc.recommended === r;
              const data = rc[r];
              return (
                <div
                  key={r}
                  className={cn(
                    "rounded-xl p-4 border transition-all",
                    isRec
                      ? "border-[var(--primary)] bg-[color-mix(in_srgb,var(--primary)_6%,transparent)]"
                      : "border-[var(--border)] bg-[var(--muted)]/40"
                  )}
                >
                  <p className={cn("text-xs font-bold uppercase tracking-wider mb-2", isRec ? "text-[var(--primary)]" : "text-[var(--muted-foreground)]")}>
                    {r === "old" ? "Old regime" : "New regime"}
                    {isRec && <span className="ml-1.5 normal-case">✓ best</span>}
                  </p>
                  <p className="text-lg font-extrabold text-[var(--foreground)]">
                    {fmtInr(data.tax_liability)}
                  </p>
                  <p className="text-xs text-[var(--muted-foreground)] mt-0.5">tax liability</p>
                  <p className={cn("text-xs font-semibold mt-1", data.refund_or_payable >= 0 ? "text-emerald-600" : "text-red-500")}>
                    {data.refund_or_payable >= 0 ? `Refund ${fmtInr(data.refund_or_payable)}` : `Pay ${fmtInr(Math.abs(data.refund_or_payable))}`}
                  </p>
                </div>
              );
            })}
          </div>

          {rc.saving > 0 && (
            <p className="mt-3 text-xs text-center text-[var(--muted-foreground)]">
              You save <span className="font-semibold text-emerald-600">{fmtInr(rc.saving)}</span> by choosing the {rc.recommended} regime
            </p>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={() => router.push("/chat")}
          className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[var(--primary)] text-white text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          Start filing with Taxzy <ArrowRight size={15} />
        </button>
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function ItrWizardPage() {
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [result, setResult] = useState<RecommendResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const step = STEPS[stepIndex];
  const isInputStep = (step?.inputFields?.length ?? 0) > 0;
  const isLast = stepIndex === STEPS.length - 1;
  const progress = result ? 100 : Math.round((stepIndex / STEPS.length) * 100);

  function selectOption(stepId: string, optionId: string) {
    setAnswers((prev) => ({ ...prev, [stepId]: optionId }));
  }

  async function handleNext() {
    if (isLast || isInputStep) {
      setLoading(true);
      setError(null);
      try {
        const rec = await fetchRecommendation(answers, inputs);
        setResult(rec);
      } catch {
        setError("Couldn't reach the server. Please try again.");
      } finally {
        setLoading(false);
      }
      return;
    }
    setStepIndex((i) => i + 1);
  }

  function handleReset() {
    setStepIndex(0);
    setAnswers({});
    setInputs({});
    setResult(null);
    setError(null);
  }

  const canAdvance = isInputStep
    ? !!inputs.gross_income   // only gross_income is required on the input step
    : !!answers[step?.id];

  return (
    <div className="min-h-screen p-6 max-w-xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-xl font-bold text-[var(--foreground)]">ITR filing wizard</h1>
          {(stepIndex > 0 || result) && (
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
            >
              <RotateCcw size={12} /> Start over
            </button>
          )}
        </div>
        <p className="text-sm text-[var(--muted-foreground)]">
          {result ? "Here's your recommendation" : "Answer a few questions to find your ITR form and best tax regime"}
        </p>

        {/* Progress bar */}
        <div className="mt-4 h-1.5 rounded-full bg-[var(--muted)] overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-[var(--primary)]"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
        </div>
        <p className="text-xs text-[var(--muted-foreground)] mt-1">
          {result ? "Done" : `Step ${stepIndex + 1} of ${STEPS.length}`}
        </p>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {result ? (
          <motion.div key="result" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.25 }}>
            <ResultCard result={result} />
          </motion.div>
        ) : (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            <p className="text-base font-semibold text-[var(--foreground)] mb-1">{step.question}</p>
            {step.subtext && (
              <p className="text-sm text-[var(--muted-foreground)] mb-5">{step.subtext}</p>
            )}

            {/* Option tiles */}
            {step.options.length > 0 && (
              <div className="space-y-3 mb-6">
                {step.options.map((opt) => (
                  <OptionTile
                    key={opt.id}
                    option={opt}
                    selected={answers[step.id] === opt.id}
                    onClick={() => selectOption(step.id, opt.id)}
                  />
                ))}
              </div>
            )}

            {/* Input fields */}
            {isInputStep && (
              <div className="space-y-3 mb-6">
                {step.inputFields!.map((field) => (
                  <div key={field.key}>
                    <label className="text-xs font-medium text-[var(--muted-foreground)] mb-1 block">
                      {field.label}
                      {field.optional && <span className="ml-1 opacity-60">(optional)</span>}
                    </label>
                    <input
                      type="number"
                      placeholder={field.placeholder}
                      value={inputs[field.key] ?? ""}
                      onChange={(e) => setInputs((prev) => ({ ...prev, [field.key]: e.target.value }))}
                      className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)] transition-all"
                    />
                  </div>
                ))}
              </div>
            )}

            {error && (
              <p className="text-xs text-red-500 mb-3">{error}</p>
            )}

            <button
              onClick={handleNext}
              disabled={!canAdvance || loading}
              className={cn(
                "w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold transition-all",
                canAdvance && !loading
                  ? "bg-[var(--primary)] text-white hover:opacity-90"
                  : "bg-[var(--muted)] text-[var(--muted-foreground)] cursor-not-allowed"
              )}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  Calculating…
                </span>
              ) : isLast || isInputStep ? (
                <>Get my recommendation <ArrowRight size={15} /></>
              ) : (
                <>Continue <ArrowRight size={15} /></>
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
