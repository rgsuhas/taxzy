"use client";
import { motion } from "framer-motion";
import { Check, Circle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RefundStatus } from "@/types/api";

interface Props {
  status: RefundStatus;
}

export function RefundTimeline({ status }: Props) {
  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6">
      <p className="text-xs font-semibold uppercase tracking-widest text-[var(--taxzy-stone)] mb-6">Refund status</p>

      <div className="relative flex flex-col gap-0">
        {status.timeline.map((step, i) => {
          const isCurrent = step.step === status.current_step;
          const isDone = step.done;

          return (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1, duration: 0.2 }}
              className="flex gap-4 relative"
            >
              {/* Connector line */}
              {i < status.timeline.length - 1 && (
                <div
                  className={cn(
                    "absolute left-[11px] top-6 w-0.5 h-full",
                    isDone ? "bg-[var(--taxzy-slate)]" : "bg-[var(--border)]"
                  )}
                />
              )}

              {/* Dot */}
              <div className="shrink-0 relative z-10">
                {isDone ? (
                  <div className="w-6 h-6 rounded-full bg-[var(--taxzy-slate)] flex items-center justify-center">
                    <Check size={12} className="text-white" />
                  </div>
                ) : isCurrent ? (
                  <div className="w-6 h-6 rounded-full border-2 border-[var(--taxzy-slate)] flex items-center justify-center">
                    <motion.div
                      className="w-2.5 h-2.5 rounded-full bg-[var(--taxzy-slate)]"
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 1.2, repeat: Infinity }}
                    />
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded-full border-2 border-[var(--border)] bg-[var(--background)]" />
                )}
              </div>

              {/* Label */}
              <div className="pb-6">
                <p className={cn(
                  "text-sm font-medium",
                  isDone || isCurrent ? "text-[var(--foreground)]" : "text-[var(--taxzy-stone)]"
                )}>
                  {step.label}
                </p>
                {step.date && (
                  <p className="text-xs text-[var(--taxzy-stone)] mt-0.5">
                    {new Date(step.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                )}
                {isCurrent && (
                  <div className="flex items-center gap-1 mt-1">
                    <Loader2 size={11} className="text-[var(--taxzy-slate)] animate-spin" />
                    <span className="text-xs text-[var(--taxzy-slate)]">In progress</span>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {status.estimated_date && (
        <div className="mt-2 pt-4 border-t border-[var(--border)]">
          <p className="text-xs text-[var(--taxzy-stone)]">
            Estimated credit by{" "}
            <span className="font-semibold text-[var(--foreground)]">
              {new Date(status.estimated_date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
            </span>
          </p>
        </div>
      )}
    </div>
  );
}
