"use client";
import { useEffect, useRef } from "react";
import { ChatBubble } from "./ChatBubble";
import { TypingIndicator } from "./TypingIndicator";
import { ChatInput } from "./ChatInput";
import { useChat } from "@/hooks/useChat";
import { motion, AnimatePresence } from "framer-motion";
import type { Message } from "@/types/api";

const QUICK_PROMPTS = [
  { label: "Calculate my tax" },
  { label: "Which regime is better?" },
  { label: "What is 80C?" },
  { label: "Check my refund" },
];

export function ChatWindow() {
  const { messages, isStreaming, streamingContent, sendMessage } = useChat();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming, streamingContent]);

  const isEmpty = messages.length === 0 && !isStreaming;

  const streamingMsg: Message | null = isStreaming && streamingContent
    ? { id: -1, role: "assistant", content: streamingContent, created_at: new Date().toISOString() }
    : null;

  return (
    <div className="flex flex-col h-full">
      {/* Outer layout — centres the column */}
      <div className="flex flex-col flex-1 items-center overflow-hidden py-4 px-4 sm:px-8 md:px-12">

        {/* Black-bordered chat box */}
        <div className="flex flex-col w-full sm:w-4/5 md:w-2/3 lg:w-1/2 flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            {isEmpty ? (
              <motion.div
                key="hero"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22 }}
                className="flex flex-col items-center justify-center flex-1 px-6"
              >
                <h1 className="text-2xl font-bold text-[var(--foreground)] text-center">
                  What shall we sort out today?
                </h1>
              </motion.div>
            ) : (
              <motion.div
                key="conversation"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-1 overflow-y-auto px-4 py-6"
              >
                {messages.map((msg, i) => (
                  <ChatBubble key={msg.id} message={msg} index={i} />
                ))}
                {streamingMsg && <ChatBubble message={streamingMsg} index={messages.length} />}
                {isStreaming && !streamingContent && <TypingIndicator />}
                <div ref={bottomRef} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Input — below the bordered box */}
        <div className="w-full sm:w-4/5 md:w-2/3 lg:w-1/2 mt-3">
          <ChatInput onSend={sendMessage} disabled={isStreaming} />
        </div>

        {/* Quick-prompt chips — only on empty state */}
        {isEmpty && (
          <div className="flex flex-wrap gap-2 justify-center w-full sm:w-4/5 md:w-2/3 lg:w-1/2 mt-3">
            {QUICK_PROMPTS.map((p) => (
              <button
                key={p.label}
                onClick={() => sendMessage(p.label)}
                className="px-4 py-2 rounded-full border border-[var(--border)] bg-[var(--card)] text-sm text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
              >
                {p.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
