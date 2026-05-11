"use client";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { JargonTooltip } from "./JargonTooltip";
import type { Message } from "@/types/api";

interface Props {
  message: Message;
  index: number;
}

export function ChatBubble({ message, index }: Props) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: "easeOut", delay: index * 0.02 }}
      className={cn("flex items-end gap-2 mb-4", isUser && "flex-row-reverse")}
    >
      <div
        className={cn(
          "w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0",
          isUser ? "bg-[var(--taxzy-clay)]" : "bg-[var(--taxzy-slate)]"
        )}
      >
        {isUser ? "U" : "T"}
      </div>

      <div
        className={cn(
          "max-w-[75%] px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap",
          isUser
            ? "bg-[var(--taxzy-slate)] text-white rounded-[12px_4px_12px_12px]"
            : "bg-[var(--muted)] text-[var(--foreground)] rounded-[4px_12px_12px_12px]"
        )}
      >
        {isUser ? message.content : <JargonTooltip text={message.content} />}
      </div>
    </motion.div>
  );
}
