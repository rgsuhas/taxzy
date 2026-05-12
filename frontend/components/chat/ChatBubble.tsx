"use client";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";
import { JargonTooltip } from "./JargonTooltip";
import type { Message } from "@/types/api";

interface Props {
  message: Message;
  index: number;
}

function AssistantContent({ text }: { text: string }) {
  return (
    <ReactMarkdown
      components={{
        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
        strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
        em: ({ children }) => <em className="italic">{children}</em>,
        ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>,
        ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>,
        li: ({ children }) => <li>{children}</li>,
        code: ({ children }) => (
          <code className="bg-[var(--muted)] px-1 py-0.5 rounded text-xs font-mono">{children}</code>
        ),
        pre: ({ children }) => (
          <pre className="bg-[var(--muted)] p-3 rounded-lg text-xs font-mono overflow-x-auto mb-2">{children}</pre>
        ),
        h1: ({ children }) => <h1 className="text-base font-bold mb-1">{children}</h1>,
        h2: ({ children }) => <h2 className="text-sm font-bold mb-1">{children}</h2>,
        h3: ({ children }) => <h3 className="text-sm font-semibold mb-1">{children}</h3>,
        a: ({ href, children }) => (
          <a href={href} target="_blank" rel="noopener noreferrer" className="underline text-[var(--taxzy-slate)]">
            {children}
          </a>
        ),
      }}
    >
      {text}
    </ReactMarkdown>
  );
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
          "max-w-[75%] px-4 py-3 text-sm leading-relaxed",
          isUser
            ? "bg-[var(--taxzy-slate)] text-white rounded-[12px_4px_12px_12px] whitespace-pre-wrap"
            : "bg-[var(--muted)] text-[var(--foreground)] rounded-[4px_12px_12px_12px]"
        )}
      >
        {isUser ? (
          message.content
        ) : (
          <AssistantContent text={message.content} />
        )}
      </div>
    </motion.div>
  );
}
