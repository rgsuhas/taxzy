"use client";
import { useState, useRef, KeyboardEvent } from "react";
import { Send } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Props {
  onSend: (text: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: Props) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const onInput = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 160) + "px";
  };

  return (
    <div className="flex items-end gap-3 bg-[var(--card)] border border-[var(--border)] rounded-xl px-4 py-3 shadow-sm">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={onKeyDown}
        onInput={onInput}
        placeholder="Ask about your taxes, deductions, refund..."
        disabled={disabled}
        rows={1}
        className={cn(
          "flex-1 resize-none bg-transparent text-sm text-[var(--foreground)] placeholder:text-[var(--taxzy-stone)] outline-none leading-relaxed",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      />
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={submit}
        disabled={disabled || !value.trim()}
        className={cn(
          "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors",
          value.trim() && !disabled
            ? "bg-[var(--taxzy-slate)] text-white"
            : "bg-[var(--muted)] text-[var(--taxzy-stone)]"
        )}
      >
        <Send size={15} />
      </motion.button>
    </div>
  );
}
