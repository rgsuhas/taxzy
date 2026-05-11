"use client";
import { useCountUp } from "@/hooks/useCountUp";
import { formatINR } from "@/lib/tax-calculator";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface Props {
  label: string;
  value: number;
  description?: string;
  icon: LucideIcon;
  variant?: "default" | "success" | "accent" | "clay";
  isCurrency?: boolean;
}

const variantStyles = {
  default: "text-[var(--taxzy-ink)]",
  success: "text-[var(--taxzy-success)]",
  accent: "text-[var(--taxzy-slate)]",
  clay: "text-[var(--taxzy-clay)]",
};

export function StatCard({ label, value, description, icon: Icon, variant = "default", isCurrency = true }: Props) {
  const animated = useCountUp(Math.abs(value));

  return (
    <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-widest text-[var(--taxzy-stone)]">{label}</span>
        <Icon size={16} className="text-[var(--taxzy-stone)]" />
      </div>
      <p className={cn("money text-2xl font-semibold", variantStyles[variant])}>
        {isCurrency ? formatINR(animated) : animated.toLocaleString("en-IN")}
      </p>
      {description && (
        <p className="text-xs text-[var(--taxzy-stone)]">{description}</p>
      )}
    </div>
  );
}
