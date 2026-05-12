"use client";
import { useState, useRef, KeyboardEvent } from "react";
import { Send, Paperclip, X, FileJson } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface Props {
  onSend: (text: string, attachment?: { name: string; content: string }) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: Props) {
  const [value, setValue] = useState("");
  const [attachment, setAttachment] = useState<{ name: string; content: string } | null>(null);
  const [attachError, setAttachError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const submit = () => {
    const trimmed = value.trim();
    if ((!trimmed && !attachment) || disabled) return;
    onSend(trimmed || "(see attached JSON)", attachment ?? undefined);
    setValue("");
    setAttachment(null);
    setAttachError(null);
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

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!fileInputRef.current) return;
    fileInputRef.current.value = "";
    if (!file) return;

    if (!file.name.endsWith(".json")) {
      setAttachError("Only .json files are supported");
      return;
    }
    if (file.size > 512 * 1024) {
      setAttachError("File too large (max 512 KB)");
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const raw = ev.target?.result as string;
      try {
        JSON.parse(raw); // validate
        setAttachment({ name: file.name, content: raw });
        setAttachError(null);
      } catch {
        setAttachError("Invalid JSON — file could not be parsed");
      }
    };
    reader.readAsText(file);
  };

  const canSend = (value.trim() || attachment) && !disabled;

  return (
    <div className="flex flex-col gap-2">
      {/* Attachment chip */}
      <AnimatePresence>
        {attachment && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.97 }}
            transition={{ duration: 0.18 }}
            className="flex items-center gap-2 px-3 py-2 rounded-lg self-start"
            style={{
              background: "rgba(61,90,128,0.07)",
              border: "1px solid rgba(61,90,128,0.18)",
            }}
          >
            <FileJson size={14} style={{ color: "#3D5A80", flexShrink: 0 }} />
            <span className="text-xs font-medium truncate max-w-[180px]" style={{ color: "#3D5A80" }}>
              {attachment.name}
            </span>
            <button
              onClick={() => setAttachment(null)}
              className="ml-1 rounded-full p-0.5 hover:bg-[rgba(61,90,128,0.12)] transition-colors"
            >
              <X size={11} style={{ color: "#3D5A80" }} />
            </button>
          </motion.div>
        )}
        {attachError && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-[11px] px-1"
            style={{ color: "#DC2626" }}
          >
            {attachError}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Input row */}
      <div className="flex items-end gap-2 bg-[var(--card)] border border-[var(--border)] rounded-xl px-3 py-3 shadow-sm">
        {/* Attach button */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          className="hidden"
          onChange={onFileChange}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          title="Attach JSON file"
          className={cn(
            "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors",
            attachment
              ? "bg-[var(--taxzy-slate)] text-white"
              : "text-[var(--taxzy-stone)] hover:text-[var(--taxzy-ink)] hover:bg-[var(--muted)]",
            disabled && "opacity-40 cursor-not-allowed"
          )}
        >
          <Paperclip size={14} />
        </button>

        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          onInput={onInput}
          placeholder={attachment ? "Add a message or send the file as-is…" : "Ask about your taxes, deductions, refund…"}
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
          disabled={!canSend}
          className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors",
            canSend
              ? "bg-[var(--taxzy-slate)] text-white"
              : "bg-[var(--muted)] text-[var(--taxzy-stone)]"
          )}
        >
          <Send size={15} />
        </motion.button>
      </div>
    </div>
  );
}
