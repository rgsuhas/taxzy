"use client";
import { useEffect, useRef } from "react";
import { ChatBubble } from "./ChatBubble";
import { TypingIndicator } from "./TypingIndicator";
import { ChatInput } from "./ChatInput";
import { useChat } from "@/hooks/useChat";
import { useTaxStore } from "@/store/taxStore";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import type { Message } from "@/types/api";

export function ChatWindow() {
  const { messages, isStreaming, streamingContent, sendMessage } = useChat();
  const { filingProgress } = useTaxStore();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming, streamingContent]);

  const displayMessages = messages;
  const streamingMsg: Message | null = isStreaming && streamingContent
    ? { id: -1, role: "assistant", content: streamingContent, created_at: new Date().toISOString() }
    : null;

  return (
    <div className="flex flex-col h-full">
      {/* Filing progress bar */}
      <div className="px-4 py-2 border-b border-[var(--border)] bg-[var(--card)]">
        <div className="flex items-center justify-between text-xs text-[var(--taxzy-stone)] mb-1.5">
          <span>Filing progress</span>
          <span className="font-medium text-[var(--taxzy-slate)]">{filingProgress}%</span>
        </div>
        <Progress value={filingProgress} className="h-1.5" />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        {displayMessages.length === 0 && !isStreaming && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mt-16"
          >
            <p className="text-2xl font-bold text-[var(--taxzy-slate)] mb-2">Hi, I&apos;m Taxzy</p>
            <p className="text-[var(--taxzy-stone)] text-sm">Tell me about your income, upload Form 16, or ask anything about Indian taxes.</p>
          </motion.div>
        )}

        {displayMessages.map((msg, i) => (
          <ChatBubble key={msg.id} message={msg} index={i} />
        ))}

        {streamingMsg && <ChatBubble message={streamingMsg} index={displayMessages.length} />}
        {isStreaming && !streamingContent && <TypingIndicator />}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-4 border-t border-[var(--border)]">
        <ChatInput onSend={sendMessage} disabled={isStreaming} />
      </div>
    </div>
  );
}
