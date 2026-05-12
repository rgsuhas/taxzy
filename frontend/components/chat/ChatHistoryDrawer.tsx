"use client";
import { useEffect, useState, useCallback } from "react";
import { X, Trash2, MessageSquare, Clock, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getChatHistory, getConversation, deleteConversation } from "@/lib/api";
import { useTaxStore } from "@/store/taxStore";
import type { ConversationPreview } from "@/types/api";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onClose: () => void;
  onNewChat: () => void;
}

function timeAgo(isoDate: string) {
  const diff = Date.now() - new Date(isoDate).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(isoDate).toLocaleDateString();
}

export function ChatHistoryDrawer({ open, onClose, onNewChat }: Props) {
  const [history, setHistory] = useState<ConversationPreview[]>([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const { setMessages, setConversationId, currentConversationId } = useTaxStore();

  const loadHistory = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getChatHistory();
      setHistory(data);
    } catch {
      // silently fail — user may not be logged in
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) loadHistory();
  }, [open, loadHistory]);

  async function handleLoad(id: number) {
    try {
      const conv = await getConversation(id);
      setMessages(conv.messages);
      setConversationId(conv.conversation_id);
      onClose();
    } catch {
      // ignore
    }
  }

  async function handleDelete(e: React.MouseEvent, id: number) {
    e.stopPropagation();
    setDeletingId(id);
    try {
      await deleteConversation(id);
      setHistory((prev) => prev.filter((c) => c.conversation_id !== id));
      if (currentConversationId === id) {
        setMessages([]);
        setConversationId(null);
      }
    } catch {
      // ignore
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.aside
            key="drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="fixed right-0 top-0 h-full w-80 bg-[var(--card)] border-l border-[var(--border)] z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
              <div className="flex items-center gap-2">
                <MessageSquare size={16} className="text-[var(--taxzy-slate)]" />
                <span className="font-semibold text-[var(--foreground)] text-sm">Chat History</span>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-[var(--muted)] text-[var(--taxzy-stone)] hover:text-[var(--foreground)] transition-colors"
              >
                <X size={15} />
              </button>
            </div>

            {/* New chat button */}
            <div className="px-4 py-3 border-b border-[var(--border)]">
              <button
                onClick={() => { onNewChat(); onClose(); }}
                className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[var(--taxzy-slate)] to-[var(--taxzy-slate)]/80 text-white text-sm font-medium hover:opacity-90 transition-opacity"
              >
                <Plus size={15} />
                New conversation
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex flex-col gap-3 px-4 py-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-14 rounded-xl bg-[var(--muted)] animate-pulse" />
                  ))}
                </div>
              ) : history.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 gap-2 text-[var(--taxzy-stone)]">
                  <MessageSquare size={28} className="opacity-30" />
                  <p className="text-sm">No previous conversations</p>
                </div>
              ) : (
                <div className="flex flex-col gap-1 px-3 py-3">
                  {history.map((conv) => (
                    <button
                      key={conv.conversation_id}
                      onClick={() => handleLoad(conv.conversation_id)}
                      className={cn(
                        "group w-full text-left px-3 py-3 rounded-xl transition-colors flex items-start gap-3",
                        currentConversationId === conv.conversation_id
                          ? "bg-[var(--taxzy-slate)]/10 border border-[var(--taxzy-slate)]/20"
                          : "hover:bg-[var(--muted)]"
                      )}
                    >
                      <div className="shrink-0 mt-0.5 w-7 h-7 rounded-full bg-[var(--muted)] flex items-center justify-center">
                        <MessageSquare size={13} className="text-[var(--taxzy-stone)]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-[var(--foreground)] truncate leading-snug">
                          {conv.preview || "Empty conversation"}
                        </p>
                        <p className="flex items-center gap-1 text-xs text-[var(--taxzy-stone)] mt-0.5">
                          <Clock size={10} />
                          {timeAgo(conv.created_at)}
                        </p>
                      </div>
                      <button
                        onClick={(e) => handleDelete(e, conv.conversation_id)}
                        disabled={deletingId === conv.conversation_id}
                        className="shrink-0 opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-red-100 dark:hover:bg-red-900/30 text-[var(--taxzy-stone)] hover:text-red-500 transition-all"
                      >
                        <Trash2 size={13} />
                      </button>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
